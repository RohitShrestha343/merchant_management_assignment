import { Router } from 'express';
import { applications, history } from '../data/database.js';
import { allowRoles } from '../middleware/auth.middleware.js';
const router=Router();
router.get('/assigned',allowRoles('REVIEWER','ADMIN'),(req,res)=>{
  const rows=applications.filter(a=>req.user.role==='ADMIN' || a.assignedReviewer===req.user.id);
  res.json(rows);
});
router.post('/:id/decision',allowRoles('REVIEWER','ADMIN'),(req,res)=>{
  const app=applications.find(a=>a.id===req.params.id);
  if(!app) return res.status(404).json({message:'Application not found'});
  if(req.user.role==='REVIEWER' && app.assignedReviewer!==req.user.id) return res.status(403).json({message:'Not assigned to this application'});
  if(!['SUBMITTED','UNDER_REVIEW','NEEDS_INFORMATION'].includes(app.status)) return res.status(409).json({message:'Application is not reviewable'});
  const {decision,comments,riskLevel,riskScore}=req.body;
  if(!['APPROVED','REJECTED','NEEDS_INFORMATION'].includes(decision)) return res.status(400).json({message:'Invalid decision'});
  if(!['LOW','MEDIUM','HIGH'].includes(riskLevel) || !Number.isFinite(riskScore) || riskScore<0 || riskScore>100) return res.status(400).json({message:'Invalid risk assessment'});
  app.status=decision; app.riskLevel=riskLevel; app.riskScore=riskScore; app.reviewComment=String(comments||''); app.updatedAt=new Date().toISOString();
  history.unshift({id:`H-${Date.now()}`,applicationId:app.id,action:`${decision}: ${app.reviewComment}`,performedBy:req.user.name,createdAt:app.updatedAt});
  res.json(app);
});
export default router;
