# DB Schema (MySQL, Prisma)

## Overview
- Relational DB: MySQL (see `prisma/schema.prisma`).
- Identity: integer auto-increment primary keys; soft-delete fields exist on some tables (`deletedAt`).
- Enums: `Role(USER|ADMIN)`, `Gender(MALE|FEMALE)`, `OrderStatus(PENDING|SHIPPED|DELIVERED|CANCELLED)`.

## Tables & Columns
### User
- `id` PK, `email` (unique), `password`, `name`, `Role`, `refreshToken?`, `birthDate?`, `gender?`, `address?`, `phoneNumber?`, `createdAt`, `updatedAt`, `deletedAt?`, `bannedAt?`.

### Book
- `id` PK, `title`, `publisher?`, `summary?`, `isbn` (unique), `price`, `publicationDate?`, `createdAt`, `updatedAt`, `deletedAt?`.

### Review
- `id` PK, `rating`, `comment?`, `createdAt`, `updatedAt`, `deletedAt?`, `userId` FK→User, `bookId` FK→Book.

### Comment
- `id` PK, `comment`, `createdAt`, `updatedAt`, `deletedAt?`, `reviewId` FK→Review, `userId` FK→User.

### ReviewLike
- `id` PK, `userId` FK→User, `reviewId` FK→Review, unique(userId, reviewId).

### CommentLike
- `id` PK, `userId` FK→User, `commentId` FK→Comment, unique(userId, commentId).

### Favorite
- `id` PK, `createdAt`, `userId` FK→User, `bookId` FK→Book, unique(userId, bookId).

### Cart
- `id` PK, `userId` FK→User, `bookId` FK→Book, `quantity` (default 1), `createdAt`, `updatedAt`, unique(userId, bookId).

### Order
- `id` PK, `userId` FK→User, `orderStatus` (enum), `totalPrice`, `deliveryAddress`, `createdAt`, `updatedAt`.

### OrderItem
- `id` PK, `orderId` FK→Order, `bookId` FK→Book, `quantity`, `priceAtPurchase`.

### Category
- `id` PK, `name` (unique).

### BookCategory
- `id` PK, `bookId` FK→Book, `categoryId` FK→Category, unique(bookId, categoryId).

### Author
- `id` PK, `name`.

### BookAuthor
- `id` PK, `bookId` FK→Book, `authorId` FK→Author, unique(bookId, authorId).

## Relationships (ERD Text)
- User 1—N Review, Comment, Cart, Order, Favorite, ReviewLike, CommentLike.
- Book 1—N Review, Favorite, Cart, OrderItem; Book N—M Category (via BookCategory); Book N—M Author (via BookAuthor).
- Review 1—N Comment, ReviewLike; Comment 1—N CommentLike.
- Order 1—N OrderItem.

## How to generate an image (optional)
- From Prisma schema: use a local ERD generator (e.g., `prisma-erd-generator`) to export `db-schema.png`, or run a modeling tool (dbdiagram.io, draw.io) with the table list above.
