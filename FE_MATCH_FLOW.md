# FE Match Flow Guide

Tài liệu này dành cho FE để test nhanh luồng `like -> pending request -> accept/reject -> match -> chat`.

## Base URL

- Local: `http://localhost:5000`
- Swagger: `http://localhost:5000/api-docs`

## Auth

Tất cả API bên dưới đều cần header:

```text
Authorization: Bearer <access_token>
```

---

## 1. Gửi like hoặc pass

### Endpoint

`POST /api/interactions/request/:userId`

### Body

```json
{
  "action_type": "LIKE",
  "interaction_mode": "traditional"
}
```

### Giá trị hợp lệ

- `action_type`: `LIKE` | `PASS`
- `interaction_mode`: `traditional` | `anonymous`

### Ý nghĩa

- User hiện tại gửi hành động tới user khác.
- Nếu 2 phía đều `LIKE`, hệ thống có thể tạo `match`.

### FE dùng khi

- Bấm nút `Like`
- Bấm nút `Pass/Skip`

---

## 2. Lấy danh sách pending received

### Endpoint

`GET /api/interactions/requests/pending-received?page=1&limit=10`

### Ý nghĩa

Danh sách người đã `LIKE` current user nhưng current user chưa xử lý.

### FE dùng khi

- Màn hình `Liked You`
- Màn hình danh sách lời thích chờ duyệt

### Response data chính

- `data.requests[]`
- mỗi phần tử có `interaction_id`
- thông tin người gửi nằm trong `actor`

### Ví dụ trạng thái FE

- Nút `Accept`
- Nút `Reject`

---

## 3. Accept lời thích

### Endpoint

`POST /api/interactions/:interactionId/accept`

### Body

```json
{
  "interaction_mode": "traditional"
}
```

### Ý nghĩa

- Current user accept một lời thích đã nhận.
- Nếu hợp lệ, backend tạo `match`.

### FE dùng khi

- User bấm `Accept`

### Response mong đợi

- `data.match` có dữ liệu match mới tạo hoặc match đang active

---

## 4. Reject lời thích

### Endpoint

`POST /api/interactions/:interactionId/reject`

### Body

```json
{
  "interaction_mode": "traditional"
}
```

### Ý nghĩa

- Current user từ chối lời thích.
- Backend lưu phản hồi dạng `PASS`.

### FE dùng khi

- User bấm `Reject` / `Decline`

---

## 5. Lấy danh sách pending sent

### Endpoint

`GET /api/interactions/requests/pending-sent?page=1&limit=10`

### Ý nghĩa

Danh sách user mà current user đã `LIKE` nhưng chưa thành match.

### FE dùng khi

- Màn hình `Sent likes`
- Debug/test luồng đối soát trạng thái

### Response data chính

- `data.requests[]`
- thông tin user nhận nằm trong `target`

---

## 6. Kiểm tra trạng thái với 1 user cụ thể

### Endpoint

`GET /api/interactions/status/:userId`

### Ý nghĩa

Trả về trạng thái giữa current user và user còn lại.

### Các trạng thái có thể có

- `none`: chưa có gì
- `outgoing_like`: mình đã like họ
- `incoming_like`: họ đã like mình
- `matched`: đã match
- `passed`: một trong hai phía đã pass

### FE dùng khi

- Render CTA theo từng profile
- Quyết định hiển thị `Like`, `Accept`, `Matched`, `Passed`

### Response data chính

- `data.status`
- `data.match`
- `data.outgoingInteraction`
- `data.incomingInteraction`

---

## 7. Lấy danh sách match

### Endpoint

`GET /api/matches?page=1&limit=10`

### Ý nghĩa

Lấy toàn bộ match đang active của current user.

### FE dùng khi

- Màn hình `Matches`
- Danh sách chat

### Response data chính

- `data.matches[]`
- `data.pagination`

---

## 8. Lấy chi tiết 1 match + messages

### Endpoint

`GET /api/matches/:matchId?page=1&limit=50`

### Ý nghĩa

Lấy thông tin match và danh sách tin nhắn trong match.

### FE dùng khi

- Mở màn hình chat detail

### Response data chính

- `data.match`
- `data.messages[]`
- `data.messagesPagination`

---

## 9. Gửi tin nhắn

### Endpoint

`POST /api/matches/:matchId/messages`

### Body

```json
{
  "content": "Chào bạn nhé"
}
```

### Ý nghĩa

Gửi tin nhắn trong match đang active.

### FE dùng khi

- User bấm gửi tin nhắn trong chat box

---

## 10. Unmatch

### Endpoint

`DELETE /api/matches/:matchId`

### Ý nghĩa

Deactivate match.

### FE dùng khi

- User bấm `Unmatch`
- Ẩn cuộc trò chuyện khỏi danh sách active match

---

## Luồng FE đề xuất

### Case 1: Like rồi accept

1. User A gọi `POST /api/interactions/request/:userId`
2. User B gọi `GET /api/interactions/requests/pending-received`
3. User B gọi `POST /api/interactions/:interactionId/accept`
4. Cả 2 gọi `GET /api/matches`
5. Vào chat bằng `GET /api/matches/:matchId`

### Case 2: Like rồi reject

1. User A gửi `LIKE`
2. User B lấy `pending-received`
3. User B gọi `POST /api/interactions/:interactionId/reject`
4. Có thể kiểm tra lại bằng `GET /api/interactions/status/:userId`

### Case 3: Kiểm tra trạng thái profile card

Khi mở profile của user khác, FE có thể gọi:

`GET /api/interactions/status/:userId`

để quyết định UI:

- `none` -> hiện nút `Like`
- `outgoing_like` -> hiện `Pending`
- `incoming_like` -> hiện `Accept` / `Reject`
- `matched` -> hiện `Message`
- `passed` -> hiện `Passed` hoặc cho phép thao tác lại tùy rule FE

---

## Gợi ý mapping UI

- Discovery card:
  - Like -> `POST /api/interactions/request/:userId`
  - Pass -> `POST /api/interactions/request/:userId`
- Liked You screen:
  - List -> `GET /api/interactions/requests/pending-received`
  - Accept -> `POST /api/interactions/:interactionId/accept`
  - Reject -> `POST /api/interactions/:interactionId/reject`
- Sent Likes screen:
  - List -> `GET /api/interactions/requests/pending-sent`
- Matches screen:
  - List -> `GET /api/matches`
- Chat detail:
  - Detail -> `GET /api/matches/:matchId`
  - Send message -> `POST /api/matches/:matchId/messages`

---

## Lưu ý cho FE

- Luôn lấy `interactionId`, `matchId`, `userId` từ response thực tế.
- Không hard-code ID.
- Tất cả endpoint match/interaction đều yêu cầu token hợp lệ.
- Nếu response là `403`, thường là user không có quyền thao tác tài nguyên đó.
- Nếu response là `404`, thường là interaction hoặc match không tồn tại.

---

## API nhanh FE sẽ dùng nhiều nhất

- `POST /api/interactions/request/:userId`
- `GET /api/interactions/requests/pending-received`
- `POST /api/interactions/:interactionId/accept`
- `POST /api/interactions/:interactionId/reject`
- `GET /api/interactions/status/:userId`
- `GET /api/matches`
- `GET /api/matches/:matchId`
- `POST /api/matches/:matchId/messages`

---

## Test nhanh bằng Swagger

Mở:

`http://localhost:5000/api-docs`

Sau đó authorize Bearer token và test trực tiếp các endpoint ở nhóm:

- `Interactions`
- `Matches`
