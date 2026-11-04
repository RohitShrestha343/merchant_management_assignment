import { Router } from 'express';
import { users, applications, assignments } from '../data/database.js';
import { allowRoles } from '../middleware/auth.middleware.js';
const router=Router();
router.get('/reviewers',allowRoles('ADMIN'),(req,res)=>res.json(users.filter(u=>u.role==='REVIEWER').map(({id,name,email})=>({id,name,email}))));
router.get('/assignments',allowRoles('ADMIN'),(req,res)=>res.json(assignments));
router.post('/assignments',allowRoles('ADMIN'),(req,res)=>{
  const {applicationId,reviewerId}=req.body;
  const app=applications.find(a=>a.id===applicationId);
  const reviewer=users.find(u=>u.id===reviewerId && u.role==='REVIEWER');
  if(!app || !reviewer) return res.status(400).json({message:'Invalid application or reviewer'});
  app.assignedReviewer=reviewerId;
  const existing=assignments.find(x=>x.applicationId===applicationId);
  if(existing) existing.reviewerId=reviewerId; else assignments.push({applicationId,reviewerId});
  res.status(201).json({applicationId,reviewerId});
});
router.delete('/assignments/:id',allowRoles('ADMIN'),(req,res)=>{
  const index=assignments.findIndex(x=>x.applicationId===req.params.id);
  if(index<0) return res.status(404).json({message:'Assignment not found'});
  assignments.splice(index,1);
  const app=applications.find(a=>a.id===req.params.id); if(app) delete app.assignedReviewer;
  res.status(204).end();
});
export default router;
