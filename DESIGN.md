---
name: 步步看懂 (Step Through)
description: 一頁安靜的印刷圖版：近白紙面、髮絲線與套準十字，只讓資料與正在動的元素帶有重量。
colors:
  plate-paper: "#F5F4F6"
  warm-edge-paper: "#FAF6F5"
  green-edge-paper: "#EEF3EF"
  plate-ink: "#16181A"
  hairline-grey: "#C9C7C4"
  cycle-periwinkle: "#DCDDF3"
typography:
  display:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display-mobile:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  prose:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  display-topic:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display-topic-mobile:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.7
  ui:
    fontFamily: "Noto Sans TC, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.2
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.14em"
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.9
rounded:
  none: "0px"
spacing:
  unit: "8px"
  row: "10px"
  gutter-mobile: "16px"
  gutter-desktop: "40px"
components:
  button-primary:
    backgroundColor: "{colors.plate-ink}"
    textColor: "{colors.plate-paper}"
    rounded: "{rounded.none}"
    height: "44px"
    padding: "0 20px"
  button-control:
    backgroundColor: "{colors.plate-paper}"
    textColor: "{colors.plate-ink}"
    rounded: "{rounded.none}"
    height: "36px"
    padding: "0 12px"
  button-control-disabled:
    textColor: "{colors.hairline-grey}"
  chip-preset:
    backgroundColor: "{colors.plate-paper}"
    textColor: "{colors.plate-ink}"
    rounded: "{rounded.none}"
    height: "36px"
    padding: "0 12px"
  input-field:
    backgroundColor: "{colors.plate-paper}"
    textColor: "{colors.plate-ink}"
    rounded: "{rounded.none}"
    height: "36px"
    padding: "0 12px"
  nav-item-current:
    backgroundColor: "{colors.cycle-periwinkle}"
    textColor: "{colors.plate-ink}"
    rounded: "{rounded.none}"
    padding: "6px 8px"
  roadmap-row-live-hover:
    backgroundColor: "{colors.cycle-periwinkle}"
    textColor: "{colors.plate-ink}"
    rounded: "{rounded.none}"
    padding: "10px 8px"
  pseudocode-line-current:
    backgroundColor: "{colors.cycle-periwinkle}"
    textColor: "{colors.plate-ink}"
    typography: "{typography.code}"
    padding: "0 8px"
---

# Design System: 步步看懂

## Overview

**Creative North Star: "The Plate Section"（圖版）**

整個產品像設計年鑑裡的一頁圖版：紙面近白但不中性，讓墨色讀起來是「印出來的」而不是「渲染出來的」。除了資料本身，其餘都是套準記號、髮絲線與網點。演算法或資料結構是唯一的主角，介面退到它後面。

視覺上刻意拒絕三件事（已與使用者確認）：傳統教學網站（VisuAlgo 式的密密麻麻灰藍）、AI 產品的深色霓虹風、以及幼稚或卡通的圓潤色塊。

使用情境兩者並重：長時間自習（需耐看、不刺眼）與課堂投影（需高對比、遠距可讀）。因此底色是淺色，並提供投影模式（見 Layout）。

**Key Characteristics:**
- 近白紙面，紙角帶極淡的暖／綠漂移；不用陰影、發光，漸層只有紙角漂移與網點。
- 一個很淡的週期藍紫作為「選取／已完成／目前行」，其餘全靠墨色與髮絲線。
- 招牌動作：舞台是一張「被套準的圖版」，四角有十字記號，底下鋪網點；正在動的元素反白成實心墨色。首頁首屏的標本用同一個舞台，內容取自真實的演算法軌跡。
- 狀態一律「顏色＋記號」，不只靠顏色。
- 兩種版面：主題頁是標準工具外殼；首頁是一張目錄圖版（路線圖）。兩者共用字體、色票與髮絲線語彙。

## Colors

整體是紙與墨，加上一個安靜的週期藍紫印章色；沒有高彩度強調色。

### Primary
- **印章週期藍紫** (#DCDDF3)：唯一的強調色。用於「已完成／已排序」的格子底色、目前的章節項目、偽代碼的目前行、可點擊目錄列的 hover 底色。永遠是底色，不用作文字色。

### Neutral
- **圖版近白** (#F5F4F6)：主要紙面，整站唯一實際使用的底色。
- **暖邊近白** (#FAF6F5) 與 **綠邊近白** (#EEF3EF)：只出現在文件的紙角，讓紙面帶有印刷感。左上角偏暖、右下角偏綠，以 60%×40% 的橢圓漸層從角落淡出到紙色，角落最濃處即為這兩個色值（已實測），中段維持 #F5F4F6；不得形成可見色塊。投影模式不使用。
- **墨色** (#16181A)：所有文字、實心元素、主要控制、強調用的粗分隔線。不使用純黑。
- **髮絲灰** (#C9C7C4)：1px 線條、舞台網點、停用元素。只用於線條與裝飾，不用於需要閱讀的文字（對比不足）。

### Named Rules
**The Never-Pure Rule.** 沒有 #000 與 #FFF；墨與紙都帶一點色相。（投影模式例外：見 Layout。）
**The One Voice Rule.** 週期藍紫是全站唯一強調色，佔單一畫面面積不超過 15%；其稀有性就是重點。
**The Mark-Not-Hue Rule.** 狀態不能只靠顏色：目前＝實心墨色、已完成＝藍紫底＋細框、操作停用＝髮絲灰＋劃線、尚未上線的主題＝虛線方框＋螢幕閱讀器文字（文字維持墨色，不用髮絲灰）、已上線的主題＝實心方框、焦點＝2px 墨色外框。
**The Hairline-Is-Not-Text Rule.** 髮絲灰只畫線，不寫字。需要降低存在感的文字用墨色加透明度（約 70%），仍須達到 4.5:1。

## Typography

**Display／Body Font:** Noto Sans TC（備援：system-ui, sans-serif），以 @fontsource 自架，只載入 400 與 500，依 unicode-range 分段下載。
**Label／Mono Font:** JetBrains Mono（備援：ui-monospace, monospace），只載入拉丁字元的 400 與 500。

**Character:** 一款中性的無襯線字體貫穿全站，字重只用 400 與 500；數字、索引、偽代碼與標籤改用等寬字，欄位才對得齊。不用斜體。

### Hierarchy
- **Display** (400, 36px 手機／56px 桌機，行高 1.1–1.15, -0.02em)：首頁標題，分成兩個語意行，每行獨立斷行。主題頁標題為 44px（手機 32px）。
- **Headline** (400, 28px, 1.2, -0.01em)：首頁區塊標題，例如「主題目錄」。
- **Title** (400, 22px, 1.3–1.4)：次要區塊標題與主題頁內文的二級標題（500）。
- **Body** (400, 17px, 1.7)：首頁導言、每步說明；內文行寬 65 字元以內（導言約 34em）。
- **UI** (400, 15px, 1.7)：介面文字、說明與註腳；主題頁 MDX 內文為 16px。
- **Data** (500, 26–28px, 等寬)：舞台中的數值、計數面板。
- **Label** (400, 11px, 0.14em, 全大寫等寬)：計數器與欄位標籤，如 `Step 07 / 26`、章節名；用於資料與量測，不放在標題上方當小標。
- **Code** (400, 13px, 1.9, 等寬)：偽代碼與等寬按鈕文字，目前行以印章藍紫底加 1px 墨色外框標示。

### Named Rules
**The Tabular Rule.** 所有計數、索引、時間軸數字一律等寬、對齊；數字跳動時版面不得位移。
**The Two-Weights Rule.** 只用 400 與 500；階層靠尺寸、字體族（無襯線／等寬）與大小寫，不靠粗體。
**The Straight-Quote Rule.** 英文文案使用直引號與直撇號；彎引號會落到 CJK 字體而產生異常字距。
**The Meaningful-Number Rule.** 編號必須帶資訊：主題頁的位置標籤是「章節名 · 章內序號」，序號與首頁目錄的順序同源（），不放沒有意義的裝飾性編號。

## Layout

**主題頁**是標準工具外殼：頂部 56px 主題列（站名、位置標籤「章節名 · 章內序號」如「排序 · 01」、主題名、投影鈕、語言切換；手機只留站名與右側控制）、左側 220px 章節欄、右側 340px 說明欄（桌機大螢幕）、底部 72px 播放控制列；中間為舞台。舞台與欄位之間只用 1px 髮絲線分隔，不使用卡片。舞台邏輯上約 72px 格寬、12px 間距的陣列；計數面板為舞台下方的髮絲線表格。

**首頁**是一張目錄圖版：同樣的 56px 頂列，其下依序是首屏（左：標題、導言、主要行動；右：首屏標本）、主題目錄（依課程順序分四欄，欄間 1px 髮絲線、上緣 1px 墨色粗線）、三欄原則說明、頁尾。內容最大寬 1280px，左右留白 16px（手機）至 40px（桌機）。首頁不載入互動 JS。

間距節奏以 8px 為基準；目錄列垂直內距 10px。密度中等偏高：資訊靠髮絲線與留白分區，不靠加框與底色。斷點使用 Tailwind 預設（md 768px、lg 1024px）：章節欄與三欄原則在 md 展開，說明欄與四欄目錄在 lg 展開。

**手機**：章節欄收成橫向捲動的主題列；說明欄移到舞台下方；播放控制列固定於畫面底部，時間軸獨佔一列，主要操作（播放）永遠在拇指範圍；目錄單欄堆疊。

**投影模式**：頂列的「投影模式」切換鈕（首頁與主題頁皆有）。啟用後 `html[data-mode=projection]`：整體以 `zoom: 1.25` 放大（字級與版面同比）、紙面改為純白 #FFFFFF（墨色不變）、髮絲線加粗為 2px（由 `--hair` 變數驅動）、隱藏章節欄並讓舞台吃滿寬度、關閉紙角漂移。選擇保存在 localStorage（`step-through:mode`），並在首次繪製前套用以免閃爍。放大後有效寬度縮小，所以首頁首屏在視窗小於 1440px 時改為堆疊。此模式是 Never-Pure 規則的唯一例外。

## Elevation & Depth

完全平面。沒有陰影、模糊或發光。深度只來自三件事：髮絲線分區、元素的實心／空心反轉、以及舞台網點（16px 間距、1px 髮絲灰圓點）與套準十字構成的「圖版」感。

### Named Rules
**The Flat-Paper Rule.** 紙面不會浮起來。互動回饋用反白、外框或記號表達，不用位移或陰影。

## Shapes

直角（圓角 0）。框線一律 1px 髮絲線；選取或目前元素的框線為 1px 墨色，焦點外框 2px 墨色並外移 2px。元件之間的關係用細線與套準記號表達，不使用圓角卡片。套準十字為 11px，貼在舞台四角（內縮 4px）。狀態記號為 10px 方框：實心＝已上線，虛線（2px 線段、2px 間隔）＝即將推出。不使用圓形或圓角；導航箭頭 ← → 是文字符號，不是圖示。

## Components

### Buttons
- **Shape:** 直角，1px 墨色框。
- **Primary:** 實心墨色底、紙色字。首頁為 44px 高、20px 水平內距，15px 字；播放器的「播放」為 36px 高、最小寬 80px、等寬 13px 字。畫面上只有一個實心主要控制。
- **Control（上一步／下一步）：** 紙色底、1px 墨色框、36px 高、等寬 13px；停用時框與字轉髮絲灰並加劃線。
- **Text link / reset：** 底線文字，無框，首頁次要行動為 44px 高的可點區域、底線偏移 4px。

### Chips（預設資料）
- **Style:** 36px 高、1px 髮絲灰框、13px 字。
- **State:** hover 時框轉墨色；沒有選取態（每個都是立即動作）。

### Inputs / Fields
- **Style:** 36px 高、1px 墨色框、紙色底、等寬 15px。時間軸為原生 range，accent-color 為墨色；速度為原生 select，墨色框。
- **Error:** 輸入下方以 `✕ 訊息` 顯示（role=alert），不更動目前資料；輸入框 aria-invalid。

### Navigation
- **章節欄：** 15px 字，目前項目為藍紫底加 1px 墨色外框（aria-current=page）；其他項目無底。手機時橫向排列。
- **語言切換：** 等寬 13px「繁中｜EN」，目前語言加底線；出現在頂列與首頁頁尾，缺少翻譯的頁面不顯示該語言。

### 投影模式切換鈕
- 36px 高、1px 髮絲灰框、等寬 13px，置於頂列語言切換之前；hover 框轉墨色。啟用時（aria-pressed=true）反白為實心墨色底、紙色字，與「目前＝實心墨色」一致。純 HTML 加十幾行原生 JS，不載入框架。

### 舞台（Stage）— 招牌元件
- 1px 髮絲灰框、16px 網點底、四角 11px 套準十字。陣列格子：未處理＝空心髮絲框、目前＝實心墨色加紙色數字、已完成＝藍紫底加 1px 墨色框、空位＝虛線框；下方長條圖依目前陣列最大值縮放，並顯示等寬索引。待插入值／最小值以標籤加實心塊標示，不只靠顏色。

### 遞迴排序的舞台元素（快速排序、合併排序）
- **基準標籤與基準框：** 基準格的框加粗為 3px 墨色，上方標「▼ 基準」；目前處理的區間用括號線（1.5px 墨色、兩端向下的短豎線）蓋在格子上方。
- **i／j 指標：** 格子下方的向上實心小三角加 12px 等寬字母；兩者重疊時合併顯示為「i j」。快速排序的舞台為此固定多留上下空間，步驟之間版面不位移。
- **合併排序的遞迴樹：** 每層一列、欄位對齊原陣列索引；節點是一個橫跨其欄位的框，內有細分隔線。狀態＝虛線框（已切開）、淡藍底加墨框（已排好）、2px 墨框（目前這一段）。
- **合併區：** 左半、右半、合併三列，欄位同樣對齊。已取走的數字＝虛線框加劃線、剛取走的＝實心墨色、兩邊最前面的數字＝2px 墨框並以三角指標加 i／j 標示。
- **窄螢幕：** 舞台 SVG 有最小寬度（陣列 480px、合併樹 520px），不夠寬時在框內橫向捲動，不把數字縮到看不清楚；頁面本身不橫向溢出。

### 呼叫堆疊
- 髮絲線框內的等寬 13px 清單，頂端（目前這一層）在最上面，以藍紫底加 1px 墨色外框標示（aria-current=step）。框高固定為 6 列，更深時在框內捲動，所以堆疊變化不會推動其他內容。空的時候顯示說明文字。

### 樹狀視圖（AVL 樹）
- **節點：** 52×56px 的直角方框（不用圓形），框內上方是 20px 等寬數字、下方是 11px 等寬的「BF +1」平衡因子（永遠顯示在框內，不會被邊線穿過；負號用 −）。邊是 1px 墨色直線，從父節點底部中心接到子節點頂部中心。
- **狀態：** 實心墨色＝這一步正在處理（比較中、剛掛上的新葉、正在旋轉的兩個節點）；淡藍底加墨框＝這次插入走過的路徑；空心髮絲框＝其他。失衡節點在角落多一個 24×17px 的實心墨色小標籤（LL／RR／LR／RL），放在遠離父節點的那一側，避免被進來的邊線穿過。
- **位置：** 水平位置依「整條軌跡所有數字排序後的名次」固定，垂直位置依深度；因此旋轉時節點只上下移動、不左右跳動，直接呈現「中序順序不變」。整頁的欄數與層數固定（取整條軌跡的最大值），步驟之間版面不位移。
- **動畫：** 節點與邊在步驟切換時以 450ms 的指數緩出（cubic-bezier 0.16, 1, 0.3, 1）平滑移動；減少動態（`prefers-reduced-motion`）時**保留**這個移動、縮短為 250ms：旋轉怎麼發生本身就是資訊，不是裝飾；元素以 `data-step-motion` 標記，全域的「停用過場」規則會略過它。邊的動畫用 CSS `d` 屬性，不支援的瀏覽器（目前是 Safari）會直接跳到終點，其餘行為不變。
- **大小順序刻度軸：** 舞台底部有一條髮絲線軸，上面依序標出整條軌跡所有數字；已掛進樹的數字＝實心 6px 方塊刻度、還沒插入的＝空心方塊刻度（不只靠顏色），節點的水平位置就是它在軸上的位置。
- **空樹：** 整組內容置中於舞台——72px 的虛線「根」預留框（同陣列視圖的「空位」，1.5px 髮絲灰虛線）、其下 20px／500 的「空樹」標題、再下一行 15px 的「{v} 會成為根」。第一個數字掛上去就切換成正常的樹。舞台有 300px 的最小寬度，數字很少時樹與空狀態都置中。
- **待插入：** 還沒掛進樹的數字顯示在左上角，實心墨色小塊加「待插入」標籤，樣式同插入排序的 KEY。

### 單選晶片（基準選法）
- 外觀同預設資料晶片（36px 高、1px 髮絲灰框、13px 字）；選取時反白為實心墨色底、紙色字（＝「目前」），真正的 radio 以 sr-only 保留，鍵盤與螢幕閱讀器行為完整，聚焦時顯示 2px 墨色外框。

### 計數面板（Stats Row）
- 舞台下方的髮絲線表格，欄間 1px 分隔，上下 1px；每格為 11px 等寬標籤加 28px 等寬數字（tabular-nums）。

### 主題目錄列（Roadmap Row）
- **已上線：** 連結，實心方框記號加 17px 標題；hover 為藍紫底加 1px 墨色外框。螢幕閱讀器另讀「已上線」。
- **即將推出：** 非連結，虛線方框記號加 17px 標題，文字為墨色約 70% 不透明度；螢幕閱讀器另讀「即將推出」。同欄以 1px 髮絲線與相鄰章節分隔，欄頂為等寬章節名。

### 偽代碼
- 13px 等寬、行高 1.9，每行 8px 水平內距；目前行為藍紫底加 1px 墨色外框，並標 aria-current=step。

## Do's and Don'ts

### Do:
- **Do** 讓資料與正在動的元素成為畫面上唯一有重量的東西：目前元素實心墨色，其餘空心或髮絲線。
- **Do** 所有狀態同時用記號與顏色表達（實心／虛線方框、劃線、外框）。
- **Do** 所有計數、索引、時間軸數字使用等寬字與 tabular-nums。
- **Do** 讓首屏為靜態 HTML；互動元件按需載入（首頁零 JS）。
- **Do** 在舞台標本與文案中使用真實的演算法軌跡與數字，不使用示意性的假資料。
- **Do** 為瀏覽器預設樣式帶入設計：選取色為藍紫底墨色字、accent-color 為墨色、捲軸為髮絲灰、`prefers-reduced-motion` 時停用裝飾性過場，但保留承載資訊的步驟切換移動（標 `data-step-motion`，縮短為 250ms）。
- **Do** 讓一個舞台元素只有一種表達：目前＝實心墨色、基準＝粗框加標籤、已完成＝藍紫底加框；不要為了新演算法再引入新的顏色。
- **Do** 樹的節點位置要讓「大小順序」一眼可見：水平位置由排序名次決定，不要為了好看重新排版。
- **Do** 邊框寬度用 `border`、`border-t` 等標準工具類別（它們由 `--hair` 驅動），不要寫死 `1px` 的自訂邊框，否則投影模式的 2px 不會生效。
- **Do** 投影模式的版面覆寫寫在 layer 之外，才贏得過 Tailwind 工具類別。

### Don't:
- **Don't** 使用陰影、模糊、發光、漸層文字或圓角卡片；紙面不會浮起來。紙角漂移是漸層的唯一例外，不要再增加其他漸層。
- **Don't** 在固定於畫面邊緣、或會落在紙角的元件上放不同於紙色的實心底色而造成接縫；底部播放列只在播放器區塊內 sticky，正是為了避開右下角的綠漂移。
- **Don't** 在標題上方加小標籤（eyebrow）；標題自己承載重量。
- **Don't** 用髮絲灰寫需要閱讀的文字，也不要用 ●○ 這類字元充當狀態圖示；狀態記號是繪製的 SVG 方框。
- **Don't** 引入第二個強調色，或讓藍紫佔畫面超過 15%、或用作文字色。
- **Don't** 使用粗體（700）或斜體；階層靠尺寸、字體族與大小寫。
- **Don't** 使用純黑 #000 與純白 #FFF（投影模式除外）。
- **Don't** 用相同尺寸的圖示加標題加內文卡片排成頁面結構；用髮絲線分欄的列表與表格。
