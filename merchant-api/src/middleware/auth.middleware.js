import jwt from 'jsonwebtoken';
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'development-access-secret-change-me';

export function authenticate(req,res,next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({message:'Missing bearer token'});
  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch {
    return res.status(401).json({message:'Invalid or expired token'});
  }
}
export function allowRoles(...roles) {
  return (req,res,next) => roles.includes(req.user?.role)
    ? next()
    : res.status(403).json({message:'Forbidden'});
}
export { ACCESS_SECRET };
