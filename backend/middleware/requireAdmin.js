const requireAdmin = (req, res, next) => {
    const userType = Number(req.user?.user_type ?? req.userType);
    if (userType === 1 || userType === 2) {
        return next();
    }
    return res.status(403).json({ success: false, message: "Admin access required" });
};

module.exports = requireAdmin;

