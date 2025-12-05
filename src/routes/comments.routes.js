// src/routes/comments.routes.js
const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments.controller");

// ------------------
// 기본 CRUD
// ------------------
router.post("/", commentsController.createComment);                         // 댓글 생성
router.get("/", commentsController.getComments);                            // 댓글 목록 조회(검색/정렬/페이지네이션)
router.get("/:id", commentsController.getCommentById);                      // 단일 댓글 조회
router.patch("/:id", commentsController.updateComment);                     // 댓글 수정
router.delete("/:id", commentsController.deleteComment);                    // 댓글 삭제

// ------------------
// 관계형 Sub-resource
// ------------------
router.get("/:id/likes", commentsController.getCommentLikes);               // 댓글 좋아요 목록

module.exports = router;
