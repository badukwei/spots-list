# Spots List 測試清單

> 測試兩輪：**手動測試**（瀏覽器操作）+ **自動測試**（`/qa-only` gstack）

## 前置條件（所有測試）

### 1. 啟動服務

```bash
# Terminal 1
cd backend && npm run start:dev   # port 3001

# Terminal 2
cd frontend && npm run dev        # port 5173
```

### 2. 自動測試前：開啟 sandbox localhost 權限

`/qa-only` 需要 Claude Code 能連到 `localhost`。測試前暫時將以下加入 `~/.claude/settings.json`：

```json
"network": {
  "allowedDomains": [
    "localhost",
    "127.0.0.1",
    "github.com",
    "*.github.com",
    "registry.npmjs.org",
    "*.npmjs.org"
  ]
}
```

> **注意：** 開啟後 Claude 可以連到本機所有服務。測試結束後移除 `localhost` 和 `127.0.0.1` 兩行。
>
> **替代方案：** 不改設定，自己在 terminal 跑 `/qa-only`，把結果貼給 Claude 分析。

---

## 快速看板

### 分類管理
- [ ] TC-01 分類列表載入（正常 + 空列表）
- [ ] TC-02 新增分類（成功 + 驗證錯誤）
- [ ] TC-03 搜尋分類（有結果 + 無結果）
- [ ] TC-04 點擊分類導航到詳細頁

### 景點管理
- [ ] TC-05 景點列表載入（正常 + 空列表）
- [ ] TC-06 新增景點（成功 + 驗證錯誤）
- [ ] TC-07 點擊景點開啟詳細 Modal
- [ ] TC-08 詳細 Modal 顯示完整資訊 + 地圖連結

### 表單驗證邊界條件
- [ ] TC-09 分類名稱驗證（空白、超過 100 字）
- [ ] TC-10 景點名稱驗證（空白、超過 100 字）
- [ ] TC-11 mapsUrl 驗證（無 protocol、非法格式、正確格式）
- [ ] TC-12 備註長度驗證（超過 500 字）
- [ ] TC-13 Modal 關閉後重開不顯示舊錯誤

### 路由 / 導航
- [ ] TC-14 首頁路由 `/`
- [ ] TC-15 分類詳細頁路由 `/categories/:id`
- [ ] TC-16 不存在路由導回首頁
- [ ] TC-17 不存在的 category ID 導回首頁

### API 邊界條件（curl / backend 直接測試）
- [ ] TC-18 非法 UUID 格式回傳 400
- [ ] TC-19 不存在的資源回傳 404
- [ ] TC-20 PATCH 空 body 回傳 400
- [ ] TC-21 跨分類操作 spot 被阻擋（安全性）
- [ ] TC-22 欄位超過最大長度回傳 400

---

## TC-01：分類列表載入

**測試目標：** 首頁正確顯示所有分類；無分類時顯示 empty state。

### 手動步驟
1. 開啟 `http://localhost:5173`
2. 確認頁面標題「Spots List」顯示（Instrument Serif italic 字型）
3. 若 DB 有資料：確認分類卡片依序顯示，序號從 01 開始
4. 桌面版（≥768px）：確認是格狀排版（2-3 欄）
5. 手機版（<768px）：確認是列表排版（單欄 + ChevronRight）
6. 刪除所有分類後重整：確認出現「還沒有分類，來新增第一個吧！」

### 自動測試（/qa-only）
```
目標 URL：http://localhost:5173
檢查項目：
- 頁面有 "Spots List" 標題
- 有 "+ 新增分類" 按鈕
- 有搜尋框（placeholder "搜尋分類..."）
- 分類卡片有序號標籤（01, 02...）
```

### 預期結果
| 情境 | 預期 |
|------|------|
| 有分類 | 卡片依 createdAt 排序顯示，含序號 |
| 空列表 | 顯示「還沒有分類，來新增第一個吧！」 |
| 載入中 | 顯示「載入中...」 |
| 網路錯誤 | 顯示「載入失敗，請重新整理」 |

### Pass / Fail
- [ ] 手動：通過
- [ ] 自動：通過

---

## TC-02：新增分類

**測試目標：** 新增分類 modal 正確運作，成功後列表自動更新。

### 手動步驟

**正常流程：**
1. 點擊「+ 新增分類」按鈕
2. 確認 modal 開啟，標題「新增分類」
3. 輸入「適合一個人哭的地方」
4. 點擊「新增」
5. 確認 modal 關閉，新分類出現在列表末尾

**取消流程：**
6. 再次開啟 modal，輸入一些文字
7. 點擊「取消」
8. 確認 modal 關閉，列表未變化
9. 再次開啟 modal，確認輸入框已清空（無殘留文字）

**Escape 關閉：**
10. 開啟 modal，按 Escape
11. 確認 modal 關閉，輸入框清空

### 自動測試（/qa-only）
```
操作流程：
1. 點擊 "+ 新增分類"
2. 在輸入框填入 "自動測試分類"
3. 點擊 "新增"
4. 驗證新分類出現在列表
```

### 預期結果
| 情境 | 預期 |
|------|------|
| 新增成功 | modal 關閉，列表即時更新（TanStack Query invalidate） |
| 取消 / Escape | modal 關閉，輸入框清空，列表不變 |
| API 錯誤 | 顯示「新增失敗，請再試一次」，不關閉 modal |
| 重開 modal | 不顯示上次的錯誤訊息 |

### Pass / Fail
- [ ] 手動：通過
- [ ] 自動：通過

---

## TC-03：搜尋分類

**測試目標：** 搜尋框正確過濾分類，debounce 300ms 後才送 API request。

### 手動步驟
1. 首頁確保有至少 3 個分類（e.g. A分類、AB分類、C分類）
2. 在搜尋框輸入「A」
3. 稍等 300ms，確認只顯示名稱包含「A」的分類
4. 清空搜尋框，確認全部分類重新出現
5. 輸入不存在的關鍵字（e.g.「zzz」）
6. 確認顯示「找不到符合的分類」

### 自動測試（/qa-only）
```
操作流程：
1. 在搜尋框輸入特定關鍵字
2. 等待 400ms
3. 驗證結果只包含符合的分類
```

### 預期結果
| 情境 | 預期 |
|------|------|
| 有符合結果 | 只顯示名稱包含關鍵字的分類（後端 ilike 搜尋） |
| 無符合結果 | 顯示「找不到符合的分類」 |
| 清空搜尋框 | 恢復完整列表 |
| 快速輸入 | 不會每個字元都打 API（debounce 保護） |

### Pass / Fail
- [ ] 手動：通過
- [ ] 自動：通過

---

## TC-04：點擊分類導航

**測試目標：** 點擊分類卡片正確導航到詳細頁，URL 包含正確的 UUID。

### 手動步驟
1. 點擊任一分類卡片
2. 確認 URL 變為 `/categories/<uuid>`
3. 確認頁面標題顯示分類名稱（italic Instrument Serif）
4. 點擊左上角「返回」
5. 確認回到首頁 `/`

### 預期結果
| 情境 | 預期 |
|------|------|
| 點擊分類 | 導航到 `/categories/:id` |
| 頁面標題 | 顯示分類名稱，載入中時顯示 skeleton |
| 返回按鈕 | 回到首頁 `/` |

### Pass / Fail
- [ ] 手動：通過
- [ ] 自動：通過

---

## TC-05：景點列表載入

**測試目標：** 分類詳細頁正確顯示該分類的景點；無景點時顯示 empty state。

### 手動步驟
1. 進入一個有景點的分類詳細頁
2. 確認景點卡片顯示（名稱、地址若有）
3. 桌面版：格狀排版（2-3 欄）
4. 手機版：列表排版
5. 進入一個無景點的分類
6. 確認顯示「這個分類還沒有景點，來新增第一個吧！」

### 預期結果
| 情境 | 預期 |
|------|------|
| 有景點 | 顯示景點卡片，含名稱和地址（若有） |
| 空列表 | 顯示 empty state 提示 |
| 載入中 | 顯示「載入中...」 |

### Pass / Fail
- [ ] 手動：通過
- [ ] 自動：通過

---

## TC-06：新增景點

**測試目標：** 新增景點 modal 正確運作，所有欄位正常提交。

### 手動步驟

**最小欄位：**
1. 進入分類詳細頁，點擊「+ 新增景點」
2. 只填「名稱」欄位：「台大圖書館廁所」
3. 點擊「新增」
4. 確認景點出現在列表，地址欄位不顯示

**完整欄位：**
5. 再次新增，填入：
   - 名稱：「誠品敦南舊址」
   - 地址：「台北市大安區敦化南路一段」
   - Google Maps：`https://maps.google.com/test`
   - 備註：「已搬遷，現在是空地`
6. 確認景點顯示地址，點開後顯示完整資訊

### 預期結果
| 情境 | 預期 |
|------|------|
| 只填名稱 | 新增成功，選填欄位不顯示 |
| 完整欄位 | 全部資料正確儲存並顯示 |
| 新增成功 | modal 關閉，景點即時出現在列表 |

### Pass / Fail
- [ ] 手動：通過
- [ ] 自動：通過

---

## TC-07：點擊景點開啟詳細 Modal

**測試目標：** 點擊景點卡片開啟 SpotDetailModal，顯示正確資訊。

### 手動步驟
1. 點擊一個景點卡片
2. 確認 Modal 開啟，標題顯示景點名稱
3. 確認地址、mapsUrl（連結可點擊）、備註各自顯示
4. 點擊 Modal 外部或 X 按鈕
5. 確認 Modal 關閉

### 預期結果
| 情境 | 預期 |
|------|------|
| 有完整資訊 | 地址、地圖連結、備註全部顯示 |
| 只有名稱 | Modal 開啟但不顯示空白區塊 |
| 地圖連結 | `target="_blank"` 開新分頁 |

### Pass / Fail
- [ ] 手動：通過
- [ ] 自動：通過

---

## TC-08：地圖連結正確性

**測試目標：** mapsUrl 以正確的 href 顯示，`rel="noopener noreferrer"` 安全屬性存在。

### 手動步驟
1. 開啟含 mapsUrl 的景點詳細 Modal
2. 右鍵「地圖連結」→ 複製連結
3. 確認連結就是原始輸入的 URL（不被加工）
4. 點擊連結，確認開新分頁

### 預期結果
- mapsUrl 直接用作 href（已強制 `https://` protocol）
- `target="_blank" rel="noopener noreferrer"` 存在

### Pass / Fail
- [ ] 手動：通過
- [ ] 自動：通過

---

## TC-09：分類名稱驗證

**測試目標：** 分類名稱的邊界條件被前後端同時阻擋。

### 手動步驟（前端驗證）
1. 開啟新增分類 Modal
2. 不填任何內容，點擊「新增」
3. 確認顯示「名稱不能為空」，**不送 API**
4. 輸入 101 個字元（e.g. `'a'.repeat(101)`），點擊「新增」
5. 確認顯示「名稱不能超過 100 字」

### API 直接測試（後端驗證）
```bash
# 空名稱
curl -s -X POST http://localhost:3001/categories \
  -H "Content-Type: application/json" \
  -d '{"name":""}' | jq .

# 超長名稱（101 字元）
curl -s -X POST http://localhost:3001/categories \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$(python3 -c 'print("a"*101)')\"}" | jq .
```

### 預期結果
| 輸入 | 前端 | 後端 |
|------|------|------|
| 空字串 | 錯誤訊息，不送 API | 400 Bad Request |
| 101 字元 | 錯誤訊息，不送 API | 400 Bad Request |
| 100 字元 | 通過 | 201 Created |

### Pass / Fail
- [ ] 手動（前端）：通過
- [ ] API 測試（後端）：通過

---

## TC-10：景點名稱驗證

**測試目標：** 景點名稱空白或超長時，前後端都阻擋。

### 手動步驟
1. 開啟新增景點 Modal
2. 不填名稱，點擊「新增」→ 確認「名稱不能為空」
3. 填 101 字元的名稱 → 確認「名稱不能超過 100 字」

### API 直接測試
```bash
# 取得一個有效的 categoryId
CATEGORY_ID=$(curl -s http://localhost:3001/categories | jq -r '.[0].id')

# 空名稱
curl -s -X POST "http://localhost:3001/categories/$CATEGORY_ID/spots" \
  -H "Content-Type: application/json" \
  -d '{"name":""}' | jq .

# 超長名稱
curl -s -X POST "http://localhost:3001/categories/$CATEGORY_ID/spots" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$(python3 -c 'print("a"*101)')\"}" | jq .
```

### 預期結果
| 輸入 | 前端 | 後端 |
|------|------|------|
| 空字串 | 錯誤訊息 | 400 |
| 101 字元 | 錯誤訊息 | 400 |
| 正常名稱 | 通過 | 201 |

### Pass / Fail
- [ ] 手動（前端）：通過
- [ ] API 測試（後端）：通過

---

## TC-11：mapsUrl 驗證

**測試目標：** mapsUrl 必須包含 protocol（`https://` 或 `http://`），前後端一致。

### 手動步驟
1. 開啟新增景點 Modal
2. 填 mapsUrl：`maps.google.com/abc`（無 protocol）
3. 點擊「新增」→ 確認顯示「請輸入有效的網址（需包含 https://）」
4. 改為：`https://maps.google.com/abc` → 確認通過
5. 填 mapsUrl：`http://maps.google.com/abc` → 確認通過
6. 留空 mapsUrl → 確認通過（選填）

### API 直接測試
```bash
CATEGORY_ID=$(curl -s http://localhost:3001/categories | jq -r '.[0].id')

# 無 protocol — 應該被後端拒絕
curl -s -X POST "http://localhost:3001/categories/$CATEGORY_ID/spots" \
  -H "Content-Type: application/json" \
  -d '{"name":"test","mapsUrl":"maps.google.com"}' | jq .

# 有 protocol — 應該成功
curl -s -X POST "http://localhost:3001/categories/$CATEGORY_ID/spots" \
  -H "Content-Type: application/json" \
  -d '{"name":"test","mapsUrl":"https://maps.google.com"}' | jq .

# 空字串 — 不應該送到後端（前端 hook 轉 undefined）
```

### 預期結果
| 輸入 | 前端 | 後端 |
|------|------|------|
| `maps.google.com` | 錯誤訊息 | 400 |
| `https://maps.google.com` | 通過 | 201 |
| `http://maps.google.com` | 通過 | 201 |
| 空字串 | 通過（不送欄位） | 201（欄位為 null） |

### Pass / Fail
- [ ] 手動（前端）：通過
- [ ] API 測試（後端）：通過

---

## TC-12：備註長度驗證

**測試目標：** 備註超過 500 字時前後端阻擋。

### 手動步驟
1. 新增景點 Modal，在備註欄貼上 501 個字元
2. 確認「備註不能超過 500 字」錯誤訊息
3. 改為 500 字元 → 確認通過

### API 直接測試
```bash
CATEGORY_ID=$(curl -s http://localhost:3001/categories | jq -r '.[0].id')

curl -s -X POST "http://localhost:3001/categories/$CATEGORY_ID/spots" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"test\",\"notes\":\"$(python3 -c 'print("a"*501)')\"}" | jq .
```

### 預期結果
| 輸入 | 前端 | 後端 |
|------|------|------|
| 501 字元備註 | 錯誤訊息 | 400 |
| 500 字元備註 | 通過 | 201 |

### Pass / Fail
- [ ] 手動（前端）：通過
- [ ] API 測試（後端）：通過

---

## TC-13：Modal 關閉後重開不顯示舊錯誤

**測試目標：** API 錯誤後關閉 modal 重開，不應殘留上次的錯誤 banner。

### 手動步驟

> 模擬 API 錯誤：停掉 backend（`Ctrl+C`）再操作

1. 停掉 backend
2. 開啟新增分類 Modal，填入名稱，點擊「新增」
3. 確認顯示「新增失敗，請再試一次」
4. 點擊「取消」關閉 modal
5. 重新開啟 modal
6. **確認錯誤訊息不見了**（輸入框乾淨）
7. 重啟 backend

### 預期結果
- 關閉再重開 modal：無殘留錯誤訊息
- 此行為由 `addCategory.reset()` / `addSpot.reset()` 在關閉時觸發

### Pass / Fail
- [ ] 手動：通過

---

## TC-14：首頁路由

**測試目標：** 直接訪問 `/` 正確渲染首頁。

### 手動步驟
1. 直接在網址列輸入 `http://localhost:5173/`
2. 確認首頁正常渲染

### 預期結果
- 渲染 `HomePage` 元件
- URL 保持 `/`

### Pass / Fail
- [ ] 手動：通過
- [ ] 自動：通過

---

## TC-15：分類詳細頁路由

**測試目標：** 直接以 UUID 訪問詳細頁正常載入。

### 手動步驟
1. 取得一個有效 category UUID（從 DB 或首頁 URL 觀察）
2. 直接輸入 `http://localhost:5173/categories/<uuid>`
3. 確認頁面正常載入分類名稱和景點

### 預期結果
- 渲染 `CategoryDetailPage`
- 分類名稱、景點列表正確載入

### Pass / Fail
- [ ] 手動：通過

---

## TC-16：不存在路由導回首頁

**測試目標：** 訪問不存在的路徑，自動導回 `/`。

### 手動步驟
1. 訪問 `http://localhost:5173/random/path`
2. 確認被導回首頁
3. 訪問 `http://localhost:5173/categories`（沒有 :id）
4. 確認被導回首頁

### 預期結果
- `*` 路由觸發 `<Navigate to="/" replace />`
- URL 變為 `/`

### Pass / Fail
- [ ] 手動：通過

---

## TC-17：不存在的 Category ID 導回首頁

**測試目標：** 訪問不存在的分類 UUID 時，`useCategory` 得到 404 錯誤，`useEffect` 導回首頁。

### 手動步驟
1. 訪問 `http://localhost:5173/categories/00000000-0000-0000-0000-000000000000`
2. 確認被導回首頁 `/`

### 預期結果
- `catError` 觸發 → `navigate('/', { replace: true })`
- 不顯示空白頁或崩潰

### Pass / Fail
- [ ] 手動：通過

---

## TC-18：非法 UUID 格式回傳 400

**測試目標：** 後端 `ParseUUIDPipe` 阻擋非 UUID 格式的 param。

### API 直接測試
```bash
# 非 UUID 的 id
curl -s http://localhost:3001/categories/not-a-uuid | jq .

# 非 UUID 的 categoryId
curl -s http://localhost:3001/categories/not-a-uuid/spots | jq .

# PATCH 非 UUID
curl -s -X PATCH http://localhost:3001/categories/not-a-uuid \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}' | jq .
```

### 預期結果
```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid is expected)"
}
```

### Pass / Fail
- [ ] API 測試：通過

---

## TC-19：不存在的資源回傳 404

**測試目標：** GET/PATCH/DELETE 不存在的 UUID 回傳 404，不 500。

### API 直接測試
```bash
FAKE_ID="00000000-0000-0000-0000-000000000000"

# 不存在的 category
curl -s http://localhost:3001/categories/$FAKE_ID | jq .

# 不存在的 spot（合法的 categoryId）
REAL_CATEGORY=$(curl -s http://localhost:3001/categories | jq -r '.[0].id')
curl -s http://localhost:3001/categories/$REAL_CATEGORY/spots/$FAKE_ID | jq .

# PATCH 不存在的 category
curl -s -X PATCH http://localhost:3001/categories/$FAKE_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}' | jq .

# DELETE 不存在的 spot
curl -s -X DELETE "http://localhost:3001/categories/$REAL_CATEGORY/spots/$FAKE_ID" | jq .
```

### 預期結果
```json
{ "statusCode": 404, "message": "Category <id> not found" }
```

### Pass / Fail
- [ ] API 測試：通過

---

## TC-20：PATCH 空 body 回傳 400

**測試目標：** PATCH 必須包含至少一個欄位。

### API 直接測試
```bash
CATEGORY_ID=$(curl -s http://localhost:3001/categories | jq -r '.[0].id')

# 空 body
curl -s -X PATCH "http://localhost:3001/categories/$CATEGORY_ID" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

### 預期結果
```json
{ "statusCode": 400, "message": "Request body must not be empty" }
```

### Pass / Fail
- [ ] API 測試：通過

---

## TC-21：跨分類操作 Spot 被阻擋

**測試目標：** 用 A 分類的 ID 操作 B 分類的 spot，應回傳 404，不成功。

### API 直接測試
```bash
# 建立兩個分類
CAT_A=$(curl -s -X POST http://localhost:3001/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"分類A"}' | jq -r '.id')

CAT_B=$(curl -s -X POST http://localhost:3001/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"分類B"}' | jq -r '.id')

# 在分類 B 建立 spot
SPOT_B=$(curl -s -X POST "http://localhost:3001/categories/$CAT_B/spots" \
  -H "Content-Type: application/json" \
  -d '{"name":"B的景點"}' | jq -r '.id')

# 用分類 A 的 ID 嘗試刪除 B 的 spot（應該 404）
curl -s -X DELETE "http://localhost:3001/categories/$CAT_A/spots/$SPOT_B" | jq .

# 用分類 A 的 ID 嘗試 PATCH B 的 spot（應該 404）
curl -s -X PATCH "http://localhost:3001/categories/$CAT_A/spots/$SPOT_B" \
  -H "Content-Type: application/json" \
  -d '{"name":"被改了"}' | jq .

# 確認 B 的 spot 未被修改
curl -s "http://localhost:3001/categories/$CAT_B/spots" | jq .
```

### 預期結果
- 跨分類 DELETE/PATCH 回傳 `404 Not Found`
- B 分類的 spot 資料**未被修改**

### Pass / Fail
- [ ] API 測試：通過

---

## TC-22：欄位超過最大長度回傳 400

**測試目標：** 後端 `@MaxLength` 正確阻擋超長輸入。

### API 直接測試
```bash
CATEGORY_ID=$(curl -s http://localhost:3001/categories | jq -r '.[0].id')

# 地址超過 200 字元
curl -s -X POST "http://localhost:3001/categories/$CATEGORY_ID/spots" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"test\",\"address\":\"$(python3 -c 'print("a"*201)')\"}" | jq .

# mapsUrl 超過 500 字元
curl -s -X POST "http://localhost:3001/categories/$CATEGORY_ID/spots" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"test\",\"mapsUrl\":\"https://$(python3 -c 'print("a"*496)')\"}" | jq .
```

### 預期結果
```json
{ "statusCode": 400, "message": [...] }
```

### Pass / Fail
- [ ] API 測試：通過

---

## DB 驗證（Supabase Dashboard）

每次做完新增 / 修改 / 刪除操作後，到 Supabase Dashboard 確認資料庫狀態。

### 進入方式
1. 開啟 [supabase.com](https://supabase.com) → 登入 → 選擇 spots-list 專案
2. 左側選單 → **Table Editor**
3. 選擇要查的 table：`categories` 或 `spots`

---

### DB-01：新增分類後確認

**觸發時機：** TC-02 新增分類成功後

**在 Table Editor 檢查 `categories` table：**
1. 確認新增的分類出現在列表
2. 確認欄位值正確：

| 欄位 | 預期 |
|------|------|
| `id` | UUID 格式（e.g. `550e8400-e29b-41d4-a716-446655440000`） |
| `name` | 與前端輸入一致 |
| `created_at` | 當前時間（UTC） |

---

### DB-02：新增景點後確認

**觸發時機：** TC-06 新增景點成功後

**在 Table Editor 檢查 `spots` table：**
1. 確認新增的景點出現在列表
2. 確認欄位值正確：

| 欄位 | 預期 |
|------|------|
| `id` | UUID 格式 |
| `category_id` | 與所在分類的 UUID 一致 |
| `name` | 與前端輸入一致 |
| `address` | 有填則顯示，未填則為 `NULL` |
| `maps_url` | 有填則顯示，未填則為 `NULL` |
| `notes` | 有填則顯示，未填則為 `NULL` |
| `created_at` | 當前時間（UTC） |

---

### DB-03：選填欄位留空時確認 NULL

**觸發時機：** TC-06 只填名稱、其他欄位留空後

**在 `spots` table 確認：**
- `address`、`maps_url`、`notes` 欄位值為 `NULL`（不是空字串 `""`）

> **為什麼重要：** frontend hook 在送出前將空字串轉成 `undefined`（不帶欄位），後端收到後存為 `NULL`。若出現空字串代表轉換邏輯有誤。

---

### DB-04：外鍵關聯確認

**觸發時機：** 新增景點後

**在 `spots` table 確認：**
- `category_id` 的值在 `categories` table 中存在
- Supabase Table Editor 可點擊 `category_id` 欄位旁的外鍵圖示跳轉確認

---

### DB-05：cascade delete 確認

**觸發時機：** 刪除分類後（需透過 API 直接測試，前端目前無刪除 UI）

```bash
# 先建立分類和景點
CAT_ID=$(curl -s -X POST http://localhost:3001/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"要刪除的分類"}' | jq -r '.id')

curl -s -X POST "http://localhost:3001/categories/$CAT_ID/spots" \
  -H "Content-Type: application/json" \
  -d '{"name":"這個景點應該一起消失"}' | jq .

# 刪除分類
curl -s -X DELETE "http://localhost:3001/categories/$CAT_ID" | jq .
```

**在 `spots` table 確認：**
- 剛才新增的景點已消失（`category_id` 設有 `ON DELETE CASCADE`）
- `categories` table 中該分類也不見了

---

### Pass / Fail
- [ ] DB-01 新增分類欄位正確
- [ ] DB-02 新增景點欄位正確
- [ ] DB-03 選填欄位存為 NULL
- [ ] DB-04 外鍵關聯正確
- [ ] DB-05 cascade delete 正常

---

## 自動化測試執行（/qa-only）

當 frontend + backend 都在跑時，用 `/qa-only` 做完整 UI 測試：

```
/qa-only

目標：http://localhost:5173
測試範圍：
- 首頁載入（分類列表 + empty state）
- 新增分類流程
- 搜尋功能
- 導航到詳細頁
- 新增景點流程
- 景點詳細 Modal
- 表單驗證錯誤訊息
```

`/qa-only` 會產出：
- Health score（0-100）
- 每個測試截圖
- 發現的 bug 與 repro steps

---

## 測試結果紀錄

| 輪次 | 日期 | 測試者 | 通過 | 失敗 | 備註 |
|------|------|--------|------|------|------|
| 第一輪（手動） | | | / 22 | / 22 | |
| 第一輪（自動） | | qa-only | - | - | |
| 第二輪（手動） | | | / 22 | / 22 | |
| 第二輪（自動） | | qa-only | - | - | |
