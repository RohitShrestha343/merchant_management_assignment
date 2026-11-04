import { Router } from 'express';
import { applications, history } from '../data/database.js';
import { allowRoles } from '../middleware/auth.middleware.js';

const router = Router();
const safe = (app, user) => ({
  ...app,
  accountNumber: user?.role === 'SALES'
    ? `******${String(app.accountNumber || '').slice(-4)}`
    : app.accountNumber
});
function canSee(user,app) {
  if(user.role==='ADMIN') return true;
  if(user.role==='SALES') return app.createdBy===user.id;
  return app.assignedReviewer===user.id;
}
router.get('/',(req,res)=>{
  const page=Math.max(1,Number(req.query.page)||1), limit=Math.min(100,Math.max(1,Number(req.query.limit)||10));
  const search=String(req.query.search||'').toLowerCase(), status=String(req.query.status||'');
  let rows=applications.filter(a=>canSee(req.user,a));
  if(search) rows=rows.filter(a=>`${a.merchantName} ${a.registrationNumber}`.toLowerCase().includes(search));
  if(status) rows=rows.filter(a=>a.status===status);
  const total=rows.length;
  res.json({items:rows.slice((page-1)*limit,page*limit).map(app => safe(app, req.user)),total,page,limit});
});
router.post('/',allowRoles('SALES','ADMIN'),(req,res)=>{
  const now=new Date().toISOString();
  const app={id:`APP-${String(Date.now()).slice(-7)}`,merchantName:'',registrationNumber:'',businessType:'',address:'',contactPerson:'',email:'',phone:'',bankName:'',accountHolder:'',accountNumber:'',branch:'',status:'DRAFT',createdBy:req.user.id,createdAt:now,updatedAt:now,...req.body};
  app.createdBy=req.user.id; app.status='DRAFT';
  applications.unshift(app); res.status(201).json(safe(app, req.user));
});
router.get('/:id',(req,res)=>{
  const app=applications.find(a=>a.id===req.params.id);
  if(!app || !canSee(req.user,app)) return res.status(404).json({message:'Application not found'});
  // Only assigned reviewer and admin can receive full account data.
  const result={...app};
  if(req.user.role==='SALES') result.accountNumber = `******${String(app.accountNumber).slice(-4)}`;
  res.json(result);
});
router.patch('/:id',allowRoles('SALES','ADMIN'),(req,res)=>{
  const app=applications.find(a=>a.id===req.params.id);
  if(!app || !canSee(req.user,app) || app.status!=='DRAFT') return res.status(404).json({message:'Draft not found'});
  Object.assign(app,req.body,{id:app.id,createdBy:app.createdBy,status:'DRAFT',updatedAt:new Date().toISOString()});
  res.json(safe(app, req.user));
});
router.patch('/:id/draft',allowRoles('SALES','ADMIN'),(req,res)=>{
  const app=applications.find(a=>a.id===req.params.id);
  if(!app || !canSee(req.user,app) || app.status!=='DRAFT') return res.status(404).json({message:'Draft not found'});
  Object.assign(app,req.body,{id:app.id,createdBy:app.createdBy,status:'DRAFT',updatedAt:new Date().toISOString()});
  res.json(safe(app, req.user));
});
router.post('/:id/submit',allowRoles('SALES','ADMIN'),(req,res)=>{
  const app=applications.find(a=>a.id===req.params.id);
  if(!app || !canSee(req.user,app) || app.status!=='DRAFT') return res.status(404).json({message:'Draft not found'});
  app.status='SUBMITTED'; app.updatedAt=new Date().toISOString();
  history.unshift({id:`H-${Date.now()}`,applicationId:app.id,action:'Application submitted',performedBy:req.user.name,createdAt:app.updatedAt});
  res.json(safe(app, req.user));
});
router.get('/:id/history',(req,res)=>{
  const app=applications.find(a=>a.id===req.params.id);
  if(!app || !canSee(req.user,app)) return res.status(404).json({message:'Application not found'});
  res.json(history.filter(h=>h.applicationId===app.id));
});
export default router;
