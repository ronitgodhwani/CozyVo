const crypto=require("crypto");const {rest}=require("./_db");
const PRICE={1:39900,2:70000,3:100000},UNIT=39900;
module.exports=async(req,res)=>{
 if(req.method!=="POST")return res.status(405).end();
 const s=process.env.RAZORPAY_KEY_SECRET;if(!s)return res.status(503).json({error:"not_configured"});
 const {razorpay_order_id:oid,razorpay_payment_id:pid,razorpay_signature:sig,sessionId}=req.body||{};
 if(![oid,pid,sig,sessionId].every(v=>typeof v==="string"&&v))return res.status(400).json({verified:false});
 const exp=crypto.createHmac("sha256",s).update(oid+"|"+pid).digest("hex");
 const a=Buffer.from(exp),b=Buffer.from(sig);
 if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(400).json({verified:false});
 const q=await rest(`checkout_sessions?id=eq.${encodeURIComponent(sessionId)}&razorpay_order_id=eq.${encodeURIComponent(oid)}&select=*`);
 const ses=q.ok&&q.data&&q.data[0];if(!ses)return res.status(404).json({verified:false});
 // Order is created only now, after the signature check passed.
 const ord=await rest("orders","POST",{session_id:ses.id,razorpay_order_id:oid,razorpay_payment_id:pid,amount_paise:ses.amount_paise,savings_paise:ses.cart.reduce((a,x)=>a+x.length*UNIT-PRICE[x.length],0),customer:ses.customer});
 if(ord.ok){
  const items=ses.cart.flatMap((b,i)=>b.map(colour=>({order_id:ord.data[0].id,bundle_index:i,bundle_size:b.length,colour})));
  await rest("order_items","POST",items,"return=minimal");
  await rest(`checkout_sessions?id=eq.${ses.id}`,"PATCH",{status:"paid"},"return=minimal");
 }else if(ord.status!==409)return res.status(500).json({verified:false}); // 409 = already recorded, safe to repeat
 res.status(200).json({verified:true});
};
