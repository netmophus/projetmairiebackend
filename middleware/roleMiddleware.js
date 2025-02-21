


const roleMiddleware = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé. Rôle non autorisé.' });
    }
    next();
  };
  
  module.exports = roleMiddleware;
  