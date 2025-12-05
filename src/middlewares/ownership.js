// src/middlewares/ownership.js

// URL 파라미터 기준: /users/:id, /orders/user/:userId 등
exports.selfOrAdminByParam = (paramName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const targetId = Number(req.params[paramName]);

    if (req.user.role === "ADMIN" || req.user.id === targetId) {
      return next();
    }

    return res
      .status(403)
      .json({ message: "본인 또는 관리자만 접근할 수 있습니다." });
  };
};

// 요청 body 기준: POST /orders, POST /carts, POST /reviews 등
exports.selfOrAdminByBody = (fieldName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "인증이 필요합니다." });
    }

    const targetId = Number(req.body[fieldName]);

    if (req.user.role === "ADMIN" || req.user.id === targetId) {
      return next();
    }

    return res
      .status(403)
      .json({ message: "본인 또는 관리자만 접근할 수 있습니다." });
  };
};
