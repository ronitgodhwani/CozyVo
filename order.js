const {randomUUID}=require("crypto");const {rest}=require("./_db");
const PRICE={1:39900,2:70000,3:100000},UNIT=39900; // paise. Server is the only source of truth for price.
module.exports=async(req,res)=>{
 if(req.method!=="POST")return res.status(405).end();
 const {RAZORPAY_KEY_ID:k,RAZORPAY_KEY_SECRET:s,SUPABASE_URL:u,SUPABASE_SERVICE_ROLE_KEY:sr}=process.env;
 if(!k||!s||!u||!sr)return res.status(503).json({error:"not_configured"});
 const {cart,customer:c}=req.body||{};
 const okCart=Array.isArray(cart)&&cart.length>=1&&cart.length<=10&&cart.every(b=>Array.isArray(b)&&b.length>=1&&b.length<=3&&b.every(x=>x==="beige"||x==="teal"));
 const str=v=>typeof v==="string"&&v.trim().length>0&&v.length<200;
 const okCust=c&&str(c.name)&&/^[6-9]\d{9}$/.test(c.mobile||"")&&str(c.a1)&&str(c.a2)&&str(c.city)&&str(c.state)&&/^\d{6}$/.test(c.pin||"")&&(!c.email||/^\S+@\S+\.\S+$/.test(c.email));
 if(!okCart||!okCust)return res.status(400).json({error:"invalid"});
 const amount=cart.reduce((a,b)=>a+PRICE[b.length],0);
 const id=randomUUID();
 const rz=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Basic "+Buffer.from(k+":"+s).toString("base64")},body:JSON.stringify({amount,currency:"INR",receipt:id})});
 if(!rz.ok)return res.status(502).json({error:"gateway"});
 const o=await rz.json();
 const ins=await rest("checkout_sessions","POST",{id,razorpay_order_id:o.id,amount_paise:amount,cart,customer:c});
 if(!ins.ok)return res.status(500).json({error:"db"});
 res.status(200).json({keyId:k,orderId:o.id,sessionId:id,amount});
};
