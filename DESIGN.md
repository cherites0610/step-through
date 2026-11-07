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

使用情境兩者並重：長時間自習（需耐看、不刺眼）與課堂投影（需高對比、遠距可讀）。因此底色是淺色；投影模式是已規劃但尚未實作的變體（見 Layout）。

**Key Characteristics:**
- 單一冷白紙面；不用漸層（網點背景除外）、陰影、發光。
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
- **暖邊近白** (#FAF6F5) 與 **綠邊近白** (#EEF3EF)：設計上只出現在紙面邊緣的細微漂移，讓紙面帶有印刷感。**目前只定義了代幣，畫面上尚未套用**；套用時幅度極小，不得形成可見色塊。
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

## Layout

**主題頁**是標準工具外殼：頂部 56px 主題列（站名、Plate 編號、主題名、語言切換）、左側 220px 章節欄、右側 340px 說明欄（桌機大螢幕）、底部 72px 播放控制列；中間為舞台。舞台與欄位之間只用 1px 髮絲線分隔，不使用卡片。舞台邏輯上約 72px 格寬、12px 間距的陣列；計數面板為舞台下方的髮絲線表格。

**首頁**是一張目錄圖版：同樣的 56px 頂列，其下依序是首屏（左：標題、導言、主要行動；右：首屏標本）、主題目錄（依課程順序分四欄，欄間 1px 髮絲線、上緣 1px 墨色粗線）、三欄原則說明、頁尾。內容最大寬 1280px，左右留白 16px（手機）至 40px（桌機）。首頁不載入互動 JS。

間距節奏以 8px 為基準；目錄列垂直內距 10px。密度中等偏高：資訊靠髮絲線與留白分區，不靠加框與底色。斷點使用 Tailwind 預設（md 768px、lg 1024px）：章節欄與三欄原則在 md 展開，說明欄與四欄目錄在 lg 展開。

**手機**：章節欄收成橫向捲動的主題列；說明欄移到舞台下方；播放控制列固定於畫面底部，時間軸獨佔一列，主要操作（播放）永遠在拇指範圍；目錄單欄堆疊。

**投影模式**（已規劃，尚未實作）：字級放大約 1.25 倍；墨色對白底 #FFFFFF 提高對比；髮絲線加粗為 2px；隱藏章節欄。此模式是 Never-Pure 規則的唯一例外。

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

### 舞台（Stage）— 招牌元件
- 1px 髮絲灰框、16px 網點底、四角 11px 套準十字。陣列格子：未處理＝空心髮絲框、目前＝實心墨色加紙色數字、已完成＝藍紫底加 1px 墨色框、空位＝虛線框；下方長條圖依目前陣列最大值縮放，並顯示等寬索引。待插入值／最小值以標籤加實心塊標示，不只靠顏色。

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
- **Do** 為瀏覽器預設樣式帶入設計：選取色為藍紫底墨色字、accent-color 為墨色、捲軸為髮絲灰、`prefers-reduced-motion` 時停用過場。

### Don't:
- **Don't** 使用陰影、模糊、發光、漸層文字或圓角卡片；紙面不會浮起來。
- **Don't** 在標題上方加小標籤（eyebrow）；標題自己承載重量。
- **Don't** 用髮絲灰寫需要閱讀的文字，也不要用 ●○ 這類字元充當狀態圖示；狀態記號是繪製的 SVG 方框。
- **Don't** 引入第二個強調色，或讓藍紫佔畫面超過 15%、或用作文字色。
- **Don't** 使用粗體（700）或斜體；階層靠尺寸、字體族與大小寫。
- **Don't** 使用純黑 #000 與純白 #FFF（投影模式除外）。
- **Don't** 用相同尺寸的圖示加標題加內文卡片排成頁面結構；用髮絲線分欄的列表與表格。
