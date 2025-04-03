


// const roleMiddleware = (roles) => (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Accès refusé. Rôle non autorisé.' });
//     }
//     next();
//   };
  
//   module.exports = roleMiddleware;
  





// ✅ Après : accepter un tableau de rôles
const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!rolesArray.includes(userRole)) {
      return res.status(403).json({ message: "Accès interdit" });
    }
    next();
  };
};

module.exports = roleMiddleware;