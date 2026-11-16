const {SUPABASE_URL:U,SUPABASE_SERVICE_ROLE_KEY:K}=process.env;
const H={apikey:K,Authorization:"Bearer "+K,"Content-Type":"application/json"};
exports.rest=async(path,method="GET",body,prefer="return=representation")=>{
 const r=await fetch(`${U}/rest/v1/${path}`,{method,headers:{...H,Prefer:prefer},body:body?JSON.stringify(body):undefined});
 const t=await r.text();return{ok:r.ok,status:r.status,data:t?JSON.parse(t):null};
};
