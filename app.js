// ===== GLOSSARY =====
const glossary = {
  'BOS':          'Break of Structure — ราคาทะลุ High/Low เดิม บ่งบอกว่าแนวโน้มยังคงดำเนินต่อ',
  'MSS':          'Market Structure Shift — การเปลี่ยนโครงสร้างราคาหลัง Liquidity Sweep สัญญาณว่าทิศกำลังเปลี่ยน',
  'CHoCH':        'Change of Character — สัญญาณเปลี่ยนแนวโน้มชั้นแรก ราคาทำลายโครงสร้างฝั่งตรงข้าม',
  'OB':           'Order Block — โซนคำสั่งสำคัญของ Smart Money ราคามักกลับมา Retest ก่อนวิ่งต่อ',
  'FVG':          'Fair Value Gap — ช่องว่างราคาที่เกิดจากการเคลื่อนตัวเร็ว ราคามักกลับมาเติมเต็ม',
  'HTF':          'Higher Timeframe — กรอบเวลาใหญ่ (D1, 4H) ใช้ดูทิศทางหลัก',
  'LTF':          'Lower Timeframe — กรอบเวลาเล็ก (1H, 15m) ใช้หาจุดเข้าที่แม่นยำ',
  'SL':           'Stop Loss — จุดตัดขาดทุน กำหนดความเสี่ยงสูงสุดที่รับได้ต่อเทรด',
  'TP':           'Take Profit — เป้าหมายกำไร วางล่วงหน้าตามโครงสร้างและ Liquidity',
  'RR':           'Risk:Reward Ratio — อัตราส่วนความเสี่ยงต่อกำไร ควรอย่างน้อย 1:2',
  'EQ':           'Equilibrium — จุดสมดุล/กึ่งกลางของช่วงราคา แบ่ง Premium กับ Discount',
  'Sweep':        'Liquidity Sweep — ราคากวาด Stop Loss ออกนอกกรอบชั่วคราวก่อนกลับทิศจริง',
  'Retest':       'การที่ราคากลับมาทดสอบโซนสำคัญ (OB/FVG) ซ้ำก่อนดำเนินต่อ',
  'Accumulation': 'ช่วงที่ราคาสะสมกำลัง เคลื่อนตัวในกรอบแคบ Smart Money สะสมของเงียบๆ',
  'Manipulation': 'การที่ราคาหลอกทิศทาง โดยกวาด Stop Loss ก่อนเคลื่อนในทิศจริง',
  'Expansion':    'ช่วงที่ราคาเคลื่อนตัวแรงและเร็วในทิศทางหลักหลังการ Sweep',
  'Distribution': 'ช่วงที่ตลาดกระจายตัว Smart Money ขายตำแหน่งออกก่อนเทรนด์กลับ',
  'Liquidity':    'สภาพคล่อง — จุดที่มีคำสั่ง Stop Loss รออยู่มาก ราคามักถูกดึงไปกวาดก่อนกลับทิศ',
  'Displacement': 'แรงส่งราคา — แท่งเทียนที่ยาว/แรง แสดงถึงการเคลื่อนที่ฉับพลันและมีทิศทางชัดเจน',
};

// ===== CHECKLIST DATA =====
const checklistData = [
  { id: 1, text: 'เทรนด์ชัดเจน (Higher High/Higher Low หรือ Lower High/Lower Low)' },
  { id: 2, text: 'มีสภาพคล่อง Liquidity (Equal Highs / Equal Lows หรือโซนสำคัญ) รออยู่' },
  { id: 3, text: 'Sweep เกิดขึ้นแล้ว — ราคากวาด Liquidity ชัดเจนแล้วกลับตัว' },
  { id: 4, text: 'MSS / BOS เกิดขึ้น ยืนยันการเปลี่ยนทิศทางโครงสร้าง' },
  { id: 5, text: 'มีโซนเข้า (Bullish / Bearish OB หรือ FVG) ในแนวโน้มที่ถูกต้อง' },
  { id: 6, text: 'มีสัญญาณยืนยัน (Pin Bar / Engulfing / CHoCH / Volume สนับสนุน)' },
  { id: 7, text: 'วาง SL ถูกจุด (ต่ำ/เหนือ Swing High/Low หรือโซน Liquidity ที่ถูกล่า)' },
  { id: 8, text: 'ตั้ง TP ชัดเจน — RR อย่างน้อย 1:2 ขึ้นไป' },
  { id: 9, text: 'ขนาดความเสี่ยงไม่เกิน 1-2% ของพอร์ตต่อออเดอร์' },
  { id: 10, text: 'วินัย — ทำตามแผน ไม่โลภ ไม่กลัว พร้อมรับทุกผลลัพธ์' },
];

// ===== MODULES & SLIDES =====
const modules = [
  {
    id: 1, icon: '📈', title: 'Foundation: Price Cycle',
    slides: [
      {
        file: 'SMC Cycle.jpg',
        title: 'SMC Price Cycle — ภาพรวมวงจรราคา',
        concepts: [
          'ราคาเคลื่อนไหวใน 4 Phase วนซ้ำตลอดเวลา: Accumulation → Manipulation → Expansion → Distribution',
          'ลำดับอ่านราคา 5 ขั้น: ① มองเทรนด์ใหญ่ ② หา Liquidity ③ รอ Sweep ④ รอโครงสร้างยืนยัน (BOS/CHoCH) ⑤ ค่อยหา Entry',
          'SMC ไม่ใช่การเดา แต่คือการอ่านพฤติกรรมราคาของ Smart Money',
          'วัฏจักรนี้วนซ้ำในทุกสภาวะตลาด ทุก Timeframe — ฝึกอ่านให้ชำนาญ',
        ],
        glossary: ['Accumulation', 'Manipulation', 'Expansion', 'Distribution', 'Sweep', 'BOS', 'CHoCH'],
      },
      {
        file: 'SMC ACCUMULATION.jpg',
        title: 'Accumulation — ภาระสะสมก่อนเกิดเทรนด์',
        concepts: [
          'ช่วงที่ราคาเคลื่อนไหวในกรอบแคบๆ ทิศทางยังไม่ชัดเจน — "ผู้เล่นใหญ่" กำลังสะสมของเงียบๆ',
          '4 สัญญาณที่ต้องสังเกต: กรอบแคบชัดเจน (มีแนวรับ-ต้านชัด), ตลาดเงียบ Volume ต่ำ, สะสมสภาพคล่อง, เตรียมพร้อมเบรก',
          'เทรดเดอร์ควรทำ: รอกรอบแตกชัดเจน อย่ารีบเดา วางแผนล่วงหน้าทั้ง SL และ TP',
          'อย่ารีบเข้าเมื่อราคาอยู่ในกรอบสะสม รอจนกว่าจะมีสัญญาณชัดเจน',
        ],
        glossary: ['Accumulation', 'SL', 'TP'],
      },
      {
        file: 'SMC BULLISH CYCLE.jpg',
        title: 'Bullish Cycle — วงจรขาขึ้นตามแนวคิด SMC',
        concepts: [
          '6 ขั้นตอน Bullish Cycle: Accumulation → Sweep (Sell-side Liquidity) → MSS/BOS → Expansion → Retest → Continuation',
          'Sweep: ราคากวาดสภาพคล่องฝั่งขาย (Sell-side) ก่อนขึ้น เพื่อล้าง Stop Loss ของฝั่งซื้อ',
          'Retest: ราคาย้อนกลับมาทดสอบโซน Demand (Turned Demand) แล้วค่อยยิงต่อทำ New High',
          'Buy Bias Setup ต้องมี: MSS/BOS ✓  Sweep Sell-side Liquidity ✓  Retest โซน Demand ✓  สัญญาณยืนยันก่อนเข้า ✓',
        ],
        glossary: ['Accumulation', 'Sweep', 'MSS', 'BOS', 'Expansion', 'Retest', 'Liquidity'],
      },
      {
        file: 'SMC PRICE CYCLE SUMMARY.jpg',
        title: 'SMC Price Cycle Summary — สรุปภาพรวม',
        concepts: [
          'วัฏจักรราคา SMC 6 ขั้น: สะสม (Accumulation) → กวาด Liquidity (Sweep) → สร้างโครงสร้างใหม่ (MSS/BOS) → ขยายตัว (Expansion) → ย้อนกลับ (Retest) → ต่อเนื่อง (Continuation)',
          'Master Checklist: โครงสร้างเดิมเป็น MSS/BOS ✓  มี Imbalance (FVG) ✓  เกิด Momentum ชัดเจน ✓  รอกลับมาสอบโซนสำคัญ ✓  ยืนยันก่อนเข้า ✓  บริหารความเสี่ยง 1-2% ✓',
          'สูตร: สะสม → กวาด → ยืนยัน → วิ่ง → ย้อน → ไปต่อ (วนซ้ำ)',
          'ตลาดวนซ้ำวัฏจักรนี้เสมอ — ผู้ที่เห็นวัฏจักรได้จะมีโอกาสก่อนคนอื่น',
        ],
        glossary: ['Accumulation', 'Sweep', 'MSS', 'BOS', 'Expansion', 'Retest', 'FVG'],
      },
    ],
  },
  {
    id: 2, icon: '🏗️', title: 'Market Structure',
    slides: [
      {
        file: 'SMC BOS.jpg',
        chart: 'bos',
        title: 'Break of Structure (BOS) — การเบรกโครงสร้าง',
        concepts: [
          'BOS = ราคา "เบรกจุดสูงสุด/ต่ำสุดเดิม" ที่เป็นโครงสร้างสำคัญของแนวโน้ม แสดงถึงการเปลี่ยนแปลงและทิศทางที่ชัดเจน',
          'Bullish BOS: ราคา Close เหนือ High เดิม → โครงสร้างเปลี่ยนเป็นขาขึ้น',
          'Bearish BOS: ราคา Close ต่ำกว่า Low เดิม → โครงสร้างเปลี่ยนเป็นขาลง',
          'เช็คลิสต์ยืนยัน BOS: ราคา Close ✓  แท่งเทียนมีแรงซื้อ/ขายสนับสนุน ✓  Volume เพิ่มขึ้น (ถ้ามี) ✓  โครงสร้างก่อนหน้ามีแนวโน้มชัดเจน ✓',
          'TIP: BOS ที่เกิดในบริเวณ OB / FVG จะมีความน่าเชื่อถือมากขึ้น',
        ],
        glossary: ['BOS', 'OB', 'FVG', 'Retest'],
      },
      {
        file: 'SMC MSS.jpg',
        chart: 'mss',
        title: 'Market Structure Shift (MSS) — การเปลี่ยนโครงสร้างราคา',
        concepts: [
          'MSS = การเปลี่ยนทิศทางโครงสร้างราคา (จากขาลงเป็นขาขึ้น หรือกลับกัน) หลังจากเกิด Liquidity Sweep',
          'เกิดขึ้นอย่างไร: ราคาอยู่ในแนวโน้มเดิม → ลงกวาด Liquidity ที่ Low เดิม → ติดกลับขึ้นอย่างแรง → ทะลุ High เดิม → MSS เกิดขึ้น!',
          '4 จุดสำคัญ: MSS ไม่จำเป็นต้องทะลุ High/Low สำคัญสุด | มักเกิดหลัง Liquidity Sweep | คือสัญญาณว่า "เกมเปลี่ยนทิศ" | รอตามทิศใหม่แล้วค่อยเข้า',
          'สัญญาณยืนยัน MSS: ราคา Close เหนือ High สำคัญเดิม ✓  Volume เพิ่มขึ้น ✓  Higher High และ Higher Low เกิดต่อเนื่อง ✓  ราคามักกลับมา Retest แล้วค่อยไปต่อ ✓',
        ],
        glossary: ['MSS', 'Sweep', 'BOS', 'Liquidity', 'Retest'],
      },
      {
        file: 'SMC CHOCH.jpg',
        chart: 'mss',
        title: 'Change of Character (CHoCH) — สัญญาณเปลี่ยนแนวโน้ม',
        concepts: [
          'CHoCH = สัญญาณที่บอกว่า "โครงสร้างตลาดอาจเปลี่ยนทิศทาง" เมื่อราคาทำลายโครงสร้างของฝั่งตรงข้ามมาระยะหนึ่ง',
          'BOS ต่างกับ CHoCH: BOS = "ต่อเนื่อง" ของแนวโน้มเดิม | CHoCH = "เปลี่ยนทิศ" ของแนวโน้ม — CHoCH คือสัญญาณเตือนล่วงหน้า',
          'สัญญาณที่ต้องสังเกต: ราคาทำลาย HL (ในขาขึ้น) หรือ HH (ในขาลง) | ปิดแท่งเทียนชัดเจน เหนือ/ใต้โครงสร้าง | Volume เพิ่มขึ้น',
          'แนวทางการเทรด: รอให้เกิด CHoCH ก่อนเสมอ | รอ Retest โครงสร้างที่ถูกทำลายเพื่อหาจุดเข้า | วาง SL ใต้/เหนือโครงสร้างล่าสุด',
        ],
        glossary: ['CHoCH', 'BOS', 'Retest', 'SL'],
      },
    ],
  },
  {
    id: 3, icon: '💧', title: 'Liquidity',
    slides: [
      {
        file: 'SMC LIQUIDITY.jpg',
        chart: 'sweep',
        title: 'Liquidity — สภาพคล่องที่เทรดเดอร์ต้องรู้',
        concepts: [
          'Liquidity = จุดที่มีคำสั่ง Stop Loss รออยู่จำนวนมากในตลาด ราคา "มักถูกดึง" ไปกวาดสิ่งเหล่านั้นก่อนจะกลับทิศทางจริง',
          'External Liquidity: สภาพคล่องนอกกรอบ เหนือ/ใต้โซนสำคัญ เช่น Equal Highs / Equal Lows — ไล่ได้ระยะ มีทิศทางสูง',
          'Internal Liquidity: สภาพคล่องในกรอบ เช่น จุด High/Low เล็กๆ ในโครงสร้างย่อย — ไล่ระยะสั้น',
          'ใช้ Liquidity วางแผน: ซื้อเมื่อราคา Sweep Buy-side แล้วกลับ ✓  ขายเมื่อราคา Sweep Sell-side แล้วกลับ ✓  วาง SL เหนือ/ใต้โซน Liquidity ที่ถูกล่า ✓  ตั้ง TP ที่ Liquidity ฝั่งตรงข้าม ✓',
        ],
        glossary: ['Liquidity', 'Sweep', 'BOS', 'CHoCH', 'SL', 'TP'],
      },
      {
        file: 'SMC IN AND EX LIQUIDITY.jpg',
        title: 'Internal & External Liquidity — สภาพคล่องภายในและภายนอก',
        concepts: [
          'Internal Liquidity: จุด High/Low เล็กๆ ในโครงสร้างย่อย (ภายในกรอบ) — ไล่ราคา เกิดบ่อย ระยะสั้น',
          'External Liquidity: จุด High/Low สำคัญของโครงสร้างใหญ่ (ภายนอกกรอบ) — ไล่ระยะยาว มีทิศทางสูง',
          'วิธีระบุ Liquidity: มองหา Equal Highs / Equal Lows | จุด High/Low สำคัญของ Timeframe ใหญ่ | โซนสร้างตัวแน่น + Volume น้อยก่อนไปหา',
          'การใช้งานจริง: รอให้ราคา Sweep Liquidity ก่อน → หา Entry หลังเกิด Structure Shift (BOS/MSS) → ใช้เป็นฐานวาง SL → ตั้ง TP ที่ Liquidity ด้านตรงข้าม',
        ],
        glossary: ['Liquidity', 'Sweep', 'BOS', 'MSS', 'SL', 'TP'],
      },
      {
        file: 'SMC MANIPULATION SWEEP.jpg',
        chart: 'sweep',
        title: 'Manipulation / Sweep — การกวาด Stop Loss และหลอกทิศทาง',
        concepts: [
          'Manipulation/Sweep = ราคาเคลื่อนตัวออกนอกกรอบชั่วคราวเพื่อกวาด Stop Loss ของนักลงทุนก่อนกลับทิศทางจริง',
          'Sweep Below Low: ราคาดิ่งต่ำกว่าจุด Low สำคัญ → กวาด SL นักลงทุนฝั่งซื้อ → กลับขึ้นอย่างแรง',
          'Sweep Above High: ราคาพุ่งสูงกว่าจุด High สำคัญ → กวาด SL นักลงทุนฝั่งขาย → กลับลงอย่างแรง',
          '4 บทเรียนสำคัญ: ① อย่าเชื่อแท่งเดียว ② มอง Liquidity เป็นหลัก ③ รอการกลับตัวยืนยัน (BOS/CHoCH) ④ เทรดตามแผน ไม่ตามอารมณ์',
          'อย่ารีบเข้าเมื่อเห็น Sweep อย่างเดียว: รอราคากลับเข้าโซนสำคัญ ✓  รูปแบบโครงสร้างยืนยัน ✓  จัดการความเสี่ยงก่อนเสมอ ✓',
        ],
        glossary: ['Sweep', 'BOS', 'CHoCH', 'Liquidity', 'SL'],
      },
      {
        file: 'SMC EXPANSION DISPLACEMENT.jpg',
        chart: 'expansion',
        title: 'Expansion / Displacement — แรงส่งของราคา',
        concepts: [
          'Expansion/Displacement = ราคาเคลื่อนตัวออกโกโลด้วยแรงซื้อ/ขายจำนวนมากฉับพลัน ทำให้เกิดแท่งเทียนยาวต่อเนื่องและแทบไม่มีการพักตัว',
          'สัญญาณ Momentum: แท่งเทียนยาว/ใหญ่ต่อเนื่อง ปิดใกล้ High/Low | Volume เพิ่มขึ้นชัดเจน | Higher High-Higher Low หรือ Lower Low-Lower High ต่อเนื่อง',
          'ทำไมต้องรอ Retest: ราคามักกลับมาทดสอบแนวต้าน/รับเดิม | ลดความเสี่ยงและเพิ่มโอกาส RR ที่ดีกว่า | Retest โซน OB/FVG ให้ความแม่นยำสูง',
          'Takeaway: Expansion คือช่วงที่เทรนด์ "ออกตัว" มักเกิดหลัง Sweep และ Retest — อย่าไล่ราคาตอนนี้ รอ Retest ค่อยเข้า',
        ],
        glossary: ['Expansion', 'Displacement', 'Retest', 'Sweep', 'OB', 'FVG', 'RR'],
      },
    ],
  },
  {
    id: 4, icon: '🎯', title: 'Key Zones',
    slides: [
      {
        file: 'SMC OB.jpg',
        chart: 'ob',
        title: 'Order Block (OB) — โซนคำสั่งสำคัญของ Smart Money',
        concepts: [
          'Order Block = โซนที่มีคำสั่งซื้อ/ขายของรายใหญ่หรือสถาบันอยู่หนาแน่น มักเป็นจุดที่ราคากลับมา Retest ก่อนต่อ',
          'Bullish OB (Demand Zone): แท่งเทียนแดงสุดท้ายก่อนเกิดการเคลื่อนขึ้นอย่างแรง — โซนที่ราคาจะกลับมาซื้อ',
          'Bearish OB (Supply Zone): แท่งเทียนเขียวสุดท้ายก่อนเกิดการลงแรง — โซนที่ราคาจะกลับมาขาย',
          'จุดสังเกตสำคัญ: เกิดก่อนการเคลื่อนที่แรง | มักอยู่ใกล้ BOS/MSS | ใช้ร่วมกับ Liquidity และ FVG ยิ่งแม่น | รอราคา Retest แล้วค่อยหาสัญญาณเข้า',
          'Checklist OB: มีโครงสร้างชัดเจน ✓  BOS/MSS ยืนยัน ✓  อยู่ในแนวรับของเทรนด์ ✓  มีจุดเข้า SL และ TP ชัดเจน ✓  ไม่ไล่ราคา รอ Retest ✓',
        ],
        glossary: ['OB', 'BOS', 'MSS', 'FVG', 'Retest', 'Liquidity', 'SL', 'TP'],
      },
      {
        file: 'SMC FVG.jpg',
        chart: 'fvg',
        title: 'Fair Value Gap (FVG) — ช่องว่างราคา',
        concepts: [
          'FVG = ช่องว่างของราคาที่เกิดจากการเคลื่อนตัวอย่างรวดเร็ว ทำให้ราคาข้ามโซนนั้นโดยไม่มีการซื้อขาย — เกิดเป็น "ช่องว่างของมูลค่า"',
          'Bullish FVG (ขาขึ้น): เกิดจากแท่งเขียวแรง ราคาโดดกระโดดขึ้น เกิดช่องว่างด้านล่าง — รอราคากลับมาเติม',
          'Bearish FVG (ขาลง): เกิดจากแท่งแดงแรง ราคาร่วงแรง เกิดช่องว่างด้านบน — รอราคากลับมาเติม',
          'ราคามักกลับมาเติมเต็ม FVG เพื่อปรับสมดุลตลาดก่อนจะไปต่อในทิศทางเดิม — TIP: วางออเดอร์รอหน้า FVG ค่อยๆ เข้า!',
          'เช็กลิสต์ FVG กับ SMC: โฟกัส FVG ที่เกิดจากแรงซื้อ/ขายชัดเจน ✓  ใช้ร่วมกับ MSS/BOS ✓  เข้าเมื่อราคากลับมาและ FVG ✓  ใช้ OB ยืนยันบริเวณเข้า ✓',
        ],
        glossary: ['FVG', 'BOS', 'MSS', 'OB'],
      },
      {
        file: 'SMC PREM DISC ZONE.jpg',
        chart: 'premdisc',
        title: 'Premium & Discount — โซนแพง-ถูกในการเทรด',
        concepts: [
          'การแบ่งช่วงราคา (Range) เป็น 2 โซนหลักเพื่อหาบริเวณที่ "คุ้มค่า" — ซื้อในโซนถูก (Discount) ขายในโซนแพง (Premium)',
          'PREMIUM (โซนแพง): ราคาสูงกว่า EQ — เหมาะสำหรับหาจังหวะ Sell',
          'DISCOUNT (โซนถูก): ราคาต่ำกว่า EQ — เหมาะสำหรับหาจังหวะ Buy',
          'วิธีหา EQ: ① หา High และ Low ของช่วงชัดเจน ② วาดเส้นกึ่งกลาง (Midpoint) ③ เหนือเส้น = Premium (แพง) ④ ใต้เส้น = Discount (ถูก)',
          'TIP: BUY Discount — SELL Premium — อย่าลืมดูบริบทเทรนด์ใหญ่และโครงสร้างด้วย!',
        ],
        glossary: ['EQ', 'OB', 'FVG'],
      },
    ],
  },
  {
    id: 5, icon: '🚀', title: 'Entry Setup',
    slides: [
      {
        file: 'SMC ENTRY CONFIRM.jpg',
        title: 'Entry Confirmation — สัญญาณยืนยันก่อนเข้าเทรด',
        concepts: [
          'Entry Confirmation = การรอ "สัญญาณยืนยัน" เพื่อเพิ่มความแม่นยำ ลดโอกาสโดนหลอก และเพิ่มโอกาสทำกำไรได้จริง',
          '5 สัญญาณยืนยัน: ① แท่งเทียนปฏิเสธ (Candle Rejection / Pin Bar / Engulfing) ② Volume สนับสนุนทิศทาง ③ โครงสร้างยืนยัน (BOS/MSS) ④ CHoCH ยืนยันการกลับตัว ⑤ Retest แล้วเด้งปฏิเสธ',
          'Checklist ก่อนเข้า 8 ข้อ: โซนสำคัญ (SR/OB/FVG) ✓  Sweep/Liquidity Grab ✓  BOS/MSS ✓  CHoCH ✓  แท่งเทียนปฏิเสธ ✓  Volume ✓  Retest ✓  Confluence กับ OB/FVG ✓',
          'ยิ่งมีหลายสัญญาณ ยิ่งได้เปรียบ: 2-3 ข้อ = โอกาสสำเร็จปานกลาง | 4-5 ข้อ = โอกาสสำเร็จสูง | 6-8 ข้อ = โอกาสสำเร็จสูงมาก',
        ],
        glossary: ['BOS', 'MSS', 'CHoCH', 'OB', 'FVG', 'Retest', 'Sweep', 'Liquidity'],
      },
      {
        file: 'SMC ENTRY AFTER MANIPULATION.jpg',
        chart: 'buySetup',
        title: 'Entry After Manipulation — โมเดลเข้าเทรดหลังหลอกกวาดสภาพคล่อง',
        concepts: [
          '5 ขั้นตอน Entry After Manipulation: ① Liquidity Sweep ② MSS/BOS ③ Displacement ④ Retest OB/FVG ⑤ Entry เมื่อมีสัญญาณยืนยัน',
          'Sweep: ราคาหลอกลงมากวาดสภาพคล่องใต้แนวรับ/Low — นี่คือกับดัก!',
          'MSS/BOS: เกิดการกลับทิศ โครงสร้างเปลี่ยนเป็นขาขึ้น — สัญญาณว่าเกมเปลี่ยนแล้ว',
          'Displacement: แท่งเทียนแรงดันราคาออกจากโซนเดิมอย่างชัดเจน',
          'เช็คลิสต์ก่อนเข้า: มี Sweep ✓  เกิด MSS/BOS ✓  มี Displacement ชัดเจน ✓  ราคาย้อนกลับโซน OB/FVG ✓  รอแท่งยืนยัน (Rejection/Engulfing) ✓  วางแผนความเสี่ยงก่อนเสมอ ✓',
        ],
        glossary: ['Sweep', 'MSS', 'BOS', 'Displacement', 'OB', 'FVG', 'Retest'],
      },
      {
        file: 'SMC BUY SETUP.jpg',
        chart: 'buySetup',
        title: 'Buy Setup — แผนเข้า Buy ด้วย SMC',
        concepts: [
          '7 ขั้นตอน Buy Setup: ① เช็ค Bias ตลาด (HTF) ② Liquidity Sweep (กวาด Low) ③ ยืนยันการกลับตัว MSS/BOS ④ จุดเข้า Entry Zone (Bullish OB/FVG) ⑤ รอราคา Retest ⑥ วาง Stop Loss ⑦ วาง Take Profit',
          'Stop Loss: วาง SL ต่ำกว่าจุดที่ถูกกวาด หรือต่ำกว่าโซน OB/FVG เล็กน้อยเพื่อการป้องกัน',
          'Take Profit: TP1 ที่โซนแนวต้าน/Equal Highs เดิม | TP2 RR 1:2 ถึง 1:3 | Trailing Stop เพื่อให้กำไรวิ่งต่อ',
          'Checklist ก่อน Buy: แนวโน้มหลักขาขึ้น ✓  ราคากวาด Low แล้ว ✓  เกิด MSS/BOS ✓  มี OB/FVG ✓  ราคา Retest แล้วมีสัญญาณ ✓  SL ถูกตำแหน่ง ✓  บริหารความเสี่ยง 1-2% ✓',
        ],
        glossary: ['HTF', 'Sweep', 'MSS', 'BOS', 'OB', 'FVG', 'Retest', 'SL', 'TP', 'RR'],
      },
      {
        file: 'SMC SELL ENTRY.jpg',
        chart: 'sellSetup',
        title: 'Sell Setup — แผนเข้า Sell ด้วย SMC',
        concepts: [
          'Sell Setup ต้องมี 3 องค์ประกอบ: สภาพคล่องด้านบนถูกกวาด (Liquidity Taken) ✓  โครงสร้างเปลี่ยนเป็นขาลง (CHoCH/MSS) ✓  มี Supply Zone ให้เข้า Sell (OB/FVG) ✓',
          'ขั้นตอน Sell Checklist: แนวโน้มเดิมเป็นขาลง ✓  High เดิมมีสภาพคล่องสะสม ✓  Sweep เหนือ High เดิม ✓  CHoCH/MSS ลง ✓  OB/FVG ฝั่ง Supply ✓  Retest โซน ✓  สัญญาณยืนยัน ✓  SL เหนือ High ล่าสุด ✓',
          'วาง TP ที่: Liquid Low | FVG ด้านล่าง | RR อย่างน้อย 1:2',
          'บริหารความเสี่ยง: เสี่ยงไม่เกิน 1-2% ต่อออเดอร์ | เลือก RR อย่างน้อย 1:2 | ไม่ไล่ราคา รอให้ครบเงื่อนไข',
        ],
        glossary: ['CHoCH', 'MSS', 'BOS', 'OB', 'FVG', 'Sweep', 'Liquidity', 'SL', 'TP', 'RR'],
      },
    ],
  },
  {
    id: 6, icon: '⚖️', title: 'Trade Management',
    slides: [
      {
        file: 'SMC STOPLOSS STRAGY.jpg',
        title: 'Stop Loss Strategy — วาง SL ให้ถูกจุดและอยู่รอดในเกม',
        concepts: [
          '4 วิธีวาง SL: ① Invalidation — ใต้/เหนือจุดที่ทำให้แผนผิดพลาด ② Structure — หลังโครงสร้างล่าสุด (High/Low หรือ Swing) ③ Liquidity — หลังจุดที่มี Liquidity (Swing High/Low) ④ OB/FVG Context — นอก OB หรือ FVG ฝั่งตรงข้าม',
          '5 กฎสำคัญในการวาง SL: ① วางตามแผน ไม่ใช่ตามความรู้สึก ② วางในจุดที่ทำให้แผน "ผิด" ไม่ใกล้ Entry เกิน ③ ให้ราคามีพื้นที่หายใจ ④ พิจารณาโครงสร้าง + Liquidity + Context ⑤ วางแล้วอย่าขยับ ถ้าไม่มีเหตุผลชัดเจน',
          'ข้อผิดพลาดที่พบบ่อย: SL แคบเกินไป โดนล้างง่าย ✗ | กว้างเกินไป เสียมากจนน่าตกใจ ✗ | ขยับ SL หมดความเสี่ยง ✗ | ไม่ดูโครงสร้าง/Liquidity ✗ | ไม่ยอมติดขาดทุน หวังให้กลับมา ✗',
        ],
        glossary: ['SL', 'OB', 'FVG', 'Liquidity'],
      },
      {
        file: 'SMC TAKE PROFIT STRATEGY.jpg',
        title: 'Take Profit Strategy — การวางเป้ากำไรและ RR',
        concepts: [
          'หลักการ Risk:Reward (RR): RR = เป้ากำไร / ความเสี่ยง — แนะนำ RR ≥ 1:1.5 ขึ้นไป ยิ่ง RR สูงยิ่งดีในระยะยาว',
          '5 วิธีกำหนด Target: ① TP1 = Swing High/แนวต้านใกล้สุด ② TP2 = ระดับต้านถัดไป ③ TP3 = High เดิม/Liquidity ด้านบน ④ Equal Highs/Lows (Liquidity) ⑤ Trailing Stop — ปล่อยกำไรวิ่ง',
          'Partial Take Profit: ปิดบางส่วน 30-50% ที่ TP1 → ย้าย SL เป็น BE (Break Even) → ปล่อยส่วนที่เหลือสู่ TP2/TP3',
          'ข้อผิดพลาดที่พบบ่อย: ตั้งเป้าเกินเหตุ ไม่สอดคล้องกับโครงสร้าง ✗ | ไม่แบ่งขาย เสียกำไรทั้งหมด ✗ | เลื่อน SL หน้ากาก กลายเป็นขาดทุนมากกว่าเดิม ✗',
        ],
        glossary: ['RR', 'SL', 'TP', 'Liquidity'],
      },
      {
        file: 'SMC RISK MM.jpg',
        title: 'Risk Management — การบริหารความเสี่ยงในการเทรด',
        concepts: [
          'แนวคิดหลัก: เสี่ยงไม่เกิน 1-2% ต่อการเทรด — ลดโอกาสพอร์ตพัง แม้จะเสียหลายครั้งติดกัน ยังเหลืองบเทรดต่อ',
          '① มีวินัยตั้ง Stop Loss: ตั้ง SL ทุกครั้งก่อนเข้าเทรด ยอมตัดขาดทุนเล็กเพื่อปกป้องพอร์ต',
          '② อัตราส่วนผลตอบแทน R:R: ตั้งขั้นต่ำ 1:2 — เสี่ยง 100 โอกาสได้ 200 แม้แม่นแค่ 40% ก็ยังกำไร',
          '③ Position Sizing: คำนวณขนาดสัญญา = ความเสี่ยงที่รับได้ (บาท) ÷ ระยะ SL (จุด/ราคา) × ขนาดสัญญา (Lots)',
          'ความผิดพลาดที่พบบ่อย: ไม่ตั้ง SL ✗ | เสี่ยงครั้งละมากเกิน ✗ | ขยับ SL ✗ | ล้างคืนตลาด Revenge Trade ✗ | Martingale เพิ่มเมื่อขาดทุน ✗',
        ],
        glossary: ['SL', 'RR', 'TP'],
      },
    ],
  },
  {
    id: 7, icon: '🔭', title: 'Advanced Techniques',
    slides: [
      {
        file: 'SMC MULTI TF.jpg',
        title: 'Multi-Timeframe Analysis — การวิเคราะห์หลายกรอบเวลา',
        concepts: [
          'MTF = ดูหลาย Timeframe เพื่อหาทิศทางหลัก (HTF) แล้วหาจุดเข้าที่แม่นยำ (LTF) — อย่าดู TF เดียว!',
          'โครงสร้างที่นิยม: D1 (HTF ทิศหลัก) → 4H (MTF ยืนยันทิศ/โซน) → 1H (LTF Setup) → 15m (จุดเข้า Entry)',
          'บทบาทแต่ละ TF: D1 ดูแนวโน้มหลัก | 4H หาสภาพคล่อง/BOS | 1H หา Structure Shift | 15m รอจุดเข้า OB, FVG, Liquidity',
          'กฎสำคัญ MTF: เทรดตามแนวโน้มใหญ่บน HTF เสมอ | รอให้ LTF สอดคล้องกับ HTF ก่อนเข้า | ใช้ LTF เจาะจงจุดเข้า ไม่ใช่เปลี่ยนทิศ',
          'เช็กลิสต์: D1 แนวโน้มชัด ✓  4H อยู่ในโซนถูกต้อง ✓  1H มี Structure Shift/BOS/CHoCH ✓  15m มี Setup OB/FVG/Liquidity ✓  RR ≥ 1:2 ✓',
        ],
        glossary: ['HTF', 'LTF', 'BOS', 'CHoCH', 'OB', 'FVG', 'Liquidity', 'RR'],
      },
      {
        file: 'SMC SESSION.jpg',
        title: 'Trading Sessions — ช่วงเวลาเทรดและ Killzone',
        concepts: [
          'Asian Session (Tokyo): 07:00–16:00 GMT+7 | ตลาดเงียบ Sideway สะสมสภาพคล่อง | Killzone 08:00–10:00 | Setup: รอ Breakout จากกรอบ Asian',
          'London Session: 14:00–23:00 GMT+7 | ตลาดเคลื่อนตัวแรง แนวโน้มเริ่ม/Breakout บ่อย | Killzone 14:00–17:00 | Setup: รอ Sweep + MSS หลังตลาดเปิด',
          'New York Session: 19:00–04:00 GMT+7 | สภาพคล่องสูงสุด มักดำเนินแนวโน้มหรือ Reversal | Killzone 19:00–22:00 | Setup: รอ Continuation หรือ Retest ที่สำคัญ',
          'Killzone = ช่วงที่มีโอกาสเทรดดีที่สุด — สภาพคล่องสูง ความผันผวนสูง โอกาสสูง',
          'Checklist เลือกเวลาเทรด: รู้ช่วงเวลา Session ✓  โฟกัสช่วง Killzone ✓  หลีกเลี่ยงช่วง Sideway/นอก Killzone ✓  เช็คข่าวสำคัญก่อนเทรด ✓',
        ],
        glossary: ['Liquidity', 'Sweep', 'MSS', 'Retest'],
      },
      {
        file: 'SMC CONFLUENCE.jpg',
        title: 'SMC Confluence — แผนรวมสัญญาณให้มั่นใจก่อนเข้า',
        concepts: [
          'Confluence = การรวมสัญญาณหลายๆ อย่างพร้อมกัน เพื่อเพิ่มความน่าจะเป็นและความมั่นใจก่อนเข้าเทรด',
          '6 ขั้นตอนรวมสัญญาณ: ① เช็กเทรนด์ HTF ② รอ Liquidity Sweep ③ รอ MSS/BOS ④ หาโซน OB/FVG ⑤ รอ Retest ⑥ รอ Confirmation (CHoCH/แท่งเทียน)',
          'ทำไมต้อง Confluence: ลดการเข้าเร็วเกินไป ✓  เพิ่มโอกาสให้แผนทำงาน ✓  ลดโอกาสโดนหลอกด้วยสัญญาณเดี่ยว ✓  สร้างความสม่ำเสมอในระยะยาว ✓',
          'ตัวอย่าง Timeframe: HTF D1/4H ดูทิศ | Setup 1H หาสัญญาณ | Entry 15m/5m รอจุดเข้า',
          'เช็กลิสต์ Confluence: เทรนด์ HTF ✓  Liquidity Sweep ✓  MSS/BOS ✓  โซน OB/FVG ✓  Retest ✓  Confirmation ✓  ครบทุกข้อ ค่อยลั่นไก!',
        ],
        glossary: ['HTF', 'Sweep', 'MSS', 'BOS', 'OB', 'FVG', 'Retest', 'CHoCH', 'Liquidity'],
      },
    ],
  },
  {
    id: 8, icon: '🧠', title: 'Mindset & Plan',
    slides: [
      {
        file: 'SMC PSYCHOLOGY.jpg',
        title: 'Trading Psychology — จิตวิทยาการเทรด',
        concepts: [
          '6 หลักจิตวิทยาการเทรด: ① มีวินัย (Discipline) ② อดทน (Patience) ③ อย่าตกเป็นเหยื่อ FOMO ④ ยอมรับการขาดทุน (Accept Losses) ⑤ ทำตามแผน (Follow the Plan) ⑥ ควบคุมอารมณ์ (Stay Calm)',
          'มีวินัย: ทำตามแผนทุกครั้งที่ครบ ไม่เปลี่ยนแผนตามอารมณ์ — วินัย คือตัวคุณในอนาคต',
          'FOMO: ไม่เข้าเพราะกลัวตกขบวน | ไม่รีบเข้าตามตลาด | คิดเสมอว่า "เราตามแผนของเรา" | โอกาสถัดไปมีเสมอ',
          'DOs: ทำตามแผนเคร่งครัด ✓  ยอมรับความเสี่ยงที่กำหนดไว้ ✓  ให้เวลากับตัวเองและตลาด ✓ | DON\'Ts: ล้างคืนตลาด ✗  เข้าโดยไม่มีแผน ✗  เปลี่ยนแผนกลางคัน ✗',
          'เทรดในคืนเดียวอาจให้โชค แต่จิตวิทยาที่แข็งแกร่งและแผนที่ดีจะให้คุณยืนระยะได้!',
        ],
        glossary: [],
      },
      {
        file: 'SMC TRADING PLAN.jpg',
        title: 'Trading Plan — แผนการเทรด SMC สำหรับมือใหม่',
        concepts: [
          '10 ขั้นตอน Pre-Trade Plan: ① เทรนด์ (HTF) ② สภาพคล่อง (Liquidity) ③ Sweep ④ ยืนยัน MSS/BOS ⑤ โซนเข้า OB/FVG ⑥ จุดเข้า (Limit Order) ⑦ SL ⑧ TP ⑨ Risk Management (1-2%) ⑩ วินัย & ทำตามแผน',
          'ก่อนกดออเดอร์: "มีแผนทุกครั้ง!" — เทรดแบบมีระบบ = เพิ่มโอกาสสำเร็จ ลดความเสี่ยง รักษาพอร์ตระยะยาว',
          'เช็กลิสต์ Pre-Trade: วาง SL ✓  Sweep แล้ว ✓  ตั้ง TP ✓  เสี่ยง ≤ 1-2% ✓  MSS/BOS ยืนยัน ✓  เข้าโซน OB/FVG ✓  ครบทุกข้อ ค่อยเข้า!',
          '"ไม่มีแผน = เสี่ยงดวง" — รอจังหวะที่ได้เปรียบ ชนะบ่อยๆ กำไรเติบโตเอง',
        ],
        glossary: ['HTF', 'Liquidity', 'Sweep', 'MSS', 'BOS', 'OB', 'FVG', 'SL', 'TP', 'RR'],
      },
      {
        file: 'SMC PRE ENTRY CHECKLIST.jpg',
        title: 'Pre-Entry Checklist — เช็กลิสต์ก่อนกดออเดอร์',
        concepts: [
          'เช็กลิสต์ช่วยให้เราตรวจสอบจริงๆ ว่า "ได้เปรียบจริง" ก่อนเข้าเทรด เพื่อลดโอกาสผิดพลาดจากอารมณ์',
          'แผนชัด + จุดเข้าแม่น + จัดการความเสี่ยงดี = โอกาสสำเร็จในระยะยาว',
          '"ไม่ครบ = ไม่เข้า!" — รอได้ = ได้เปรียบ | แม่นยำ + เทรดน้อยลง = ชนะบ่อยขึ้น',
          'กด 📋 Pre-Entry Checklist ในแถบด้านข้าง เพื่อเปิด Checklist แบบ Interactive ที่ tick ได้จริง!',
        ],
        glossary: ['OB', 'FVG', 'BOS', 'MSS', 'Sweep', 'SL', 'TP', 'RR'],
        hasChecklist: true,
      },
      {
        file: 'SMC COMMON MISTAKE.jpg',
        title: 'Common Mistakes — ข้อผิดพลาดที่พบบ่อยในการเทรด SMC',
        concepts: [
          '7 ข้อผิดพลาดที่พบบ่อย: ① FOMO (เข้าเพราะกลัวตกรถ) ② No Confirmation (ไม่รอสัญญาณ) ③ Overtrade (เทรดบ่อยเกิน) ④ No Stop Loss (ไม่ตั้ง SL) ⑤ Ignoring HTF (ไม่ดูแนวโน้มใหญ่) ⑥ No Plan (ไม่มีแผน) ⑦ Move SL (เลื่อน Stop Loss)',
          'FOMO: ราคายังไม่ถึงจุดสำคัญ แต่รีบเข้า → เสี่ยงโดนกลับตัว | No Confirmation: ไม่รอให้เกิด BOS/CHoCH หรือสัญญาณกลับตัว',
          'No Plan: ไม่รู้จะเข้า/ออกตอนไหน → ตัดสินใจด้วยอารมณ์ตลอด | Move SL: เริ่มขาดทุนแล้วเลื่อน SL ออก → ขาดทุนเพิ่มขึ้นเรื่อยๆ',
          'เช็กก่อนเข้า: แนวโน้มใหญ่ HTF ✓  จุดเข้า + SL + TP ชัดเจน ✓  มีสัญญาณยืนยัน (BOS/CHoCH/Liquidity) ✓  R:R อย่างน้อย 1:2 ✓',
          'สรุป: การเทรดที่ดี ไม่ใช่แค่หาจุดเข้าเก่ง แต่คือ "หลีกเลี่ยงข้อผิดพลาดซ้ำๆ" ให้ได้ — เทรดน้อยลง แต่แม่นขึ้น!',
        ],
        glossary: ['BOS', 'CHoCH', 'HTF', 'SL', 'TP', 'RR', 'Liquidity'],
      },
    ],
  },
];

// ===== STATE =====
let currentModule = 0;
let currentSlide = 0;
let readSlides = new Set();
let bookmarks = new Set();
let notes = {};
let checkState = {};
let notesTimer = null;

const TOTAL_SLIDES = modules.reduce((s, m) => s + m.slides.length, 0);

// ===== STORAGE =====
function saveProgress() {
  localStorage.setItem('smc_read', JSON.stringify([...readSlides]));
}
function loadProgress() {
  try {
    const data = JSON.parse(localStorage.getItem('smc_read') || '[]');
    readSlides = new Set(data);
  } catch { readSlides = new Set(); }
}
function saveBookmarks() {
  localStorage.setItem('smc_bookmarks', JSON.stringify([...bookmarks]));
}
function loadBookmarks() {
  try {
    bookmarks = new Set(JSON.parse(localStorage.getItem('smc_bookmarks') || '[]'));
  } catch { bookmarks = new Set(); }
}
function saveNotes() {
  localStorage.setItem('smc_notes', JSON.stringify(notes));
}
function loadNotes() {
  try { notes = JSON.parse(localStorage.getItem('smc_notes') || '{}'); }
  catch { notes = {}; }
}
function saveChecklist() {
  localStorage.setItem('smc_check', JSON.stringify(checkState));
}
function loadChecklist() {
  try {
    checkState = JSON.parse(localStorage.getItem('smc_check') || '{}');
  } catch { checkState = {}; }
}
function slideKey(mi, si) { return `${mi}-${si}`; }

// ===== NAVIGATION =====
function goTo(mi, si) {
  currentModule = mi;
  currentSlide = si;
  renderSlide();
  renderSidebar();
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function navigate(dir) {
  const mod = modules[currentModule];
  const newSlide = currentSlide + dir;
  if (newSlide >= 0 && newSlide < mod.slides.length) {
    goTo(currentModule, newSlide);
  } else if (dir > 0 && currentModule < modules.length - 1) {
    goTo(currentModule + 1, 0);
  } else if (dir < 0 && currentModule > 0) {
    goTo(currentModule - 1, modules[currentModule - 1].slides.length - 1);
  }
}
function toggleMark() {
  const key = slideKey(currentModule, currentSlide);
  const mod = modules[currentModule];
  const wasModuleDone = mod.slides.every((_, si) => readSlides.has(slideKey(currentModule, si)));

  if (readSlides.has(key)) readSlides.delete(key);
  else readSlides.add(key);
  saveProgress();
  renderMarkBtn();
  updateProgress();
  renderSidebar();

  // Celebrate module / course completion
  const nowModuleDone = mod.slides.every((_, si) => readSlides.has(slideKey(currentModule, si)));
  if (!wasModuleDone && nowModuleDone) {
    if (readSlides.size === TOTAL_SLIDES) {
      showToast('🏆 ยอดเยี่ยม! เรียนครบทุกสไลด์แล้ว — พร้อมลุยตลาดจริง!', true);
    } else {
      showToast(`🎉 จบ Module "${mod.title}" แล้ว! เก่งมาก`, true);
    }
  }
}

// ===== RENDER =====
function renderSidebar() {
  const nav = document.getElementById('moduleNav');
  nav.innerHTML = modules.map((mod, mi) => {
    const doneCount = mod.slides.filter((_, si) => readSlides.has(slideKey(mi, si))).length;
    const isActive = mi === currentModule;
    const allDone = doneCount === mod.slides.length;
    const slideItems = mod.slides.map((slide, si) => {
      const isRead = readSlides.has(slideKey(mi, si));
      const isActiveSl = isActive && si === currentSlide;
      const isBm = bookmarks.has(slideKey(mi, si));
      return `<li class="slide-nav-item ${isRead ? 'read' : ''} ${isActiveSl ? 'active-slide' : ''}"
        onclick="goTo(${mi}, ${si})">
        <span class="read-dot"></span>
        <span>${slide.title.split('—')[0].trim()}</span>
        ${isBm ? '<span class="bm-dot">★</span>' : ''}
      </li>`;
    }).join('');
    return `<div class="module-item ${isActive ? 'active' : ''}">
      <div class="module-header" onclick="goTo(${mi}, 0)">
        <span class="module-name">
          <span class="module-icon">${mod.icon}</span>
          ${mod.title}
        </span>
        <span class="module-badge ${allDone ? 'done' : ''}">${doneCount}/${mod.slides.length}</span>
      </div>
      ${isActive ? `<ul class="slides-list">${slideItems}</ul>` : ''}
    </div>`;
  }).join('');
}

function renderSlide() {
  const mod = modules[currentModule];
  const slide = mod.slides[currentSlide];
  const key = slideKey(currentModule, currentSlide);

  document.getElementById('slideModuleName').textContent = `${mod.icon} ${mod.title}`;
  document.getElementById('slideCounter').textContent = `${currentSlide + 1} / ${mod.slides.length}`;
  document.getElementById('slideTitle').textContent = slide.title;

  const img = document.getElementById('mainImg');
  img.style.opacity = '0';
  img.src = `Picture SMC/${slide.file}`;
  img.onload = () => { img.style.opacity = '1'; };

  document.getElementById('prevBtn').disabled = currentModule === 0 && currentSlide === 0;
  document.getElementById('nextBtn').disabled =
    currentModule === modules.length - 1 && currentSlide === mod.slides.length - 1;

  // replay fade-up animation
  const body = document.getElementById('slideBody');
  body.style.animation = 'none';
  void body.offsetWidth;
  body.style.animation = '';

  // interactive candlestick chart (if this slide has one)
  const sec = document.getElementById('chartSection');
  if (slide.chart && window.mountChart) {
    window.mountChart(sec, slide.chart);
  } else {
    sec.innerHTML = '';
    sec.style.display = 'none';
  }

  renderMarkBtn();
  renderBookmarkBtn();
  renderConcepts(slide);
  renderNotes();
}

function renderBookmarkBtn() {
  const key = slideKey(currentModule, currentSlide);
  const btn = document.getElementById('bookmarkBtn');
  const isBm = bookmarks.has(key);
  btn.textContent = isBm ? '★' : '☆';
  btn.classList.toggle('marked', isBm);
}

function renderNotes() {
  const key = slideKey(currentModule, currentSlide);
  document.getElementById('notesArea').value = notes[key] || '';
  document.getElementById('notesStatus').textContent = '';
}

function renderMarkBtn() {
  const key = slideKey(currentModule, currentSlide);
  const btn = document.getElementById('markBtn');
  const isRead = readSlides.has(key);
  btn.textContent = isRead ? '✓ อ่านแล้ว' : '○ Mark as Read';
  btn.classList.toggle('marked', isRead);
}

function renderConcepts(slide) {
  const panel = document.getElementById('conceptsPanel');
  const items = slide.concepts.map((c, i) =>
    `<li><span class="c-num">${i + 1}</span><span>${c}</span></li>`
  ).join('');

  let glossaryHtml = '';
  if (slide.glossary && slide.glossary.length) {
    const tags = slide.glossary.map(term => {
      const def = glossary[term] || term;
      return `<span class="glossary-tag">${term}<span class="g-tooltip">${def}</span></span>`;
    }).join('');
    glossaryHtml = `<div class="glossary-section">
      <div class="glossary-label">คำศัพท์สำคัญ (hover เพื่ออ่าน)</div>
      <div class="glossary-tags">${tags}</div>
    </div>`;
  }

  const checklistNote = slide.hasChecklist
    ? `<div style="margin-top:16px;padding:12px 16px;background:#0a1322;border:1px solid var(--gold);border-radius:4px;font-size:13px;color:var(--gold);font-family:var(--thai);">
        ▶ กด <strong>PRE-ENTRY CHECKLIST</strong> ในแถบด้านซ้ายเพื่อเปิด Checklist แบบ Interactive ที่ tick ได้จริง!
       </div>`
    : '';

  panel.innerHTML = `<h3>Key Concepts</h3><ul>${items}</ul>${glossaryHtml}${checklistNote}`;
}

function updateProgress() {
  const count = readSlides.size;
  const pct = Math.round((count / TOTAL_SLIDES) * 100);
  document.getElementById('progressLabel').textContent = `${count} / ${TOTAL_SLIDES}`;
  document.getElementById('progressPct').textContent = `${pct}%`;
  const circumference = 2 * Math.PI * 16; // r = 16
  const offset = circumference * (1 - pct / 100);
  document.getElementById('ringFill').style.strokeDashoffset = offset;
}

// ===== LIGHTBOX =====
function openLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox(); closeChecklist(); closeGlossary(); closeBookmarks();
    closeSearch();
    document.activeElement && document.activeElement.blur();
    return;
  }
  // don't hijack keys while typing in notes/search
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea') {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') return;
    if (e.key !== '/') return;
  }
  if (e.key === 'ArrowRight') navigate(1);
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === '/') { e.preventDefault(); document.getElementById('searchInput').focus(); }
  if (e.key.toLowerCase() === 'm') toggleMark();
  if (e.key.toLowerCase() === 'f') toggleBookmark();
  if (e.key.toLowerCase() === 'g') openGlossary();
  if (e.key.toLowerCase() === 'b') openBookmarks();
});

// ===== CHECKLIST =====
function openChecklist() {
  document.getElementById('checklistOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderChecklist();
}
function closeChecklist() {
  document.getElementById('checklistOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function renderChecklist() {
  const list = document.getElementById('checklistItems');
  list.innerHTML = checklistData.map(item => {
    const checked = !!checkState[item.id];
    return `<li class="check-item ${checked ? 'checked' : ''}" onclick="toggleCheckItem(${item.id})">
      <span class="check-num">${item.id}.</span>
      <input type="checkbox" id="chk${item.id}" ${checked ? 'checked' : ''} onclick="event.stopPropagation(); toggleCheckItem(${item.id})">
      <label for="chk${item.id}">${item.text}</label>
    </li>`;
  }).join('');
  updateCheckScore();
}
function toggleCheckItem(id) {
  checkState[id] = !checkState[id];
  saveChecklist();
  renderChecklist();
}
function updateCheckScore() {
  const done = Object.values(checkState).filter(Boolean).length;
  document.getElementById('checkScore').textContent = done;
  const pct = Math.round((done / checklistData.length) * 100);
  document.getElementById('checkProgressFill').style.width = `${pct}%`;
}
function resetChecklist() {
  checkState = {};
  saveChecklist();
  renderChecklist();
}

// ===== NOTES =====
function onNotesInput() {
  const key = slideKey(currentModule, currentSlide);
  notes[key] = document.getElementById('notesArea').value;
  document.getElementById('notesStatus').textContent = 'กำลังบันทึก...';
  clearTimeout(notesTimer);
  notesTimer = setTimeout(() => {
    if (!notes[key]) delete notes[key];
    saveNotes();
    document.getElementById('notesStatus').textContent = '✓ บันทึกแล้ว';
    setTimeout(() => { document.getElementById('notesStatus').textContent = ''; }, 1500);
  }, 600);
}

// ===== BOOKMARKS =====
function toggleBookmark() {
  const key = slideKey(currentModule, currentSlide);
  if (bookmarks.has(key)) { bookmarks.delete(key); showToast('นำออกจากรายการบันทึกแล้ว'); }
  else { bookmarks.add(key); showToast('⭐ บันทึกสไลด์แล้ว'); }
  saveBookmarks();
  renderBookmarkBtn();
  renderSidebar();
}
function openBookmarks() {
  renderBookmarksList();
  document.getElementById('bookmarksOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeBookmarks() {
  document.getElementById('bookmarksOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function renderBookmarksList() {
  const wrap = document.getElementById('bmList');
  if (!bookmarks.size) {
    wrap.innerHTML = '<div class="bm-empty">ยังไม่มีสไลด์ที่บันทึก<br>กดไอคอน ☆ ที่หัวข้อสไลด์เพื่อบันทึก</div>';
    return;
  }
  const entries = [...bookmarks].sort().map(key => {
    const [mi, si] = key.split('-').map(Number);
    const mod = modules[mi]; if (!mod) return '';
    const slide = mod.slides[si]; if (!slide) return '';
    return `<div class="bm-entry" onclick="goTo(${mi}, ${si}); closeBookmarks();">
      <span class="bm-icon">${mod.icon}</span>
      <div class="bm-text">
        <div class="bm-title">${slide.title.split('—')[0].trim()}</div>
        <div class="bm-mod">${mod.title}</div>
      </div>
      <button class="bm-remove" onclick="event.stopPropagation(); removeBookmark('${key}')">✕</button>
    </div>`;
  }).join('');
  wrap.innerHTML = entries;
}
function removeBookmark(key) {
  bookmarks.delete(key);
  saveBookmarks();
  renderBookmarksList();
  renderBookmarkBtn();
  renderSidebar();
}

// ===== GLOSSARY MODAL =====
function openGlossary() {
  document.getElementById('glossSearch').value = '';
  renderGlossaryList('');
  document.getElementById('glossaryOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeGlossary() {
  document.getElementById('glossaryOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function renderGlossaryList(q) {
  const term = (q || '').toLowerCase().trim();
  const list = document.getElementById('glossList');
  const entries = Object.entries(glossary).filter(([k, v]) =>
    !term || k.toLowerCase().includes(term) || v.toLowerCase().includes(term)
  );
  if (!entries.length) {
    list.innerHTML = '<div class="gloss-empty">ไม่พบคำศัพท์ที่ตรงกับการค้นหา</div>';
    return;
  }
  list.innerHTML = entries.map(([k, v]) =>
    `<div class="gloss-entry"><div class="gloss-term">${k}</div><div class="gloss-def">${v}</div></div>`
  ).join('');
}

// ===== SEARCH =====
function onSearch(q) {
  const term = (q || '').toLowerCase().trim();
  const box = document.getElementById('searchResults');
  if (!term) { box.classList.remove('open'); box.innerHTML = ''; return; }

  const results = [];
  modules.forEach((mod, mi) => {
    mod.slides.forEach((slide, si) => {
      const inTitle = slide.title.toLowerCase().includes(term);
      const matchConcept = slide.concepts.find(c => c.toLowerCase().includes(term));
      const inGloss = (slide.glossary || []).some(g => g.toLowerCase().includes(term));
      if (inTitle || matchConcept || inGloss) {
        let sub = mod.title;
        if (!inTitle && matchConcept) {
          let snippet = matchConcept;
          const idx = snippet.toLowerCase().indexOf(term);
          const start = Math.max(0, idx - 20);
          snippet = (start > 0 ? '…' : '') + snippet.slice(start, start + 60) + '…';
          sub = highlight(snippet, term);
        }
        results.push({ mi, si, title: highlight(slide.title, term), sub });
      }
    });
  });

  if (!results.length) {
    box.innerHTML = '<div class="search-empty">ไม่พบผลลัพธ์ 🔍</div>';
  } else {
    box.innerHTML = results.slice(0, 12).map(r =>
      `<div class="search-item" onclick="jumpTo(${r.mi}, ${r.si})">
        <div class="si-title">${r.title}</div>
        <div class="si-sub">${r.sub}</div>
      </div>`
    ).join('');
  }
  box.classList.add('open');
}
function highlight(text, term) {
  const i = text.toLowerCase().indexOf(term);
  if (i < 0) return text;
  return text.slice(0, i) + '<mark>' + text.slice(i, i + term.length) + '</mark>' + text.slice(i + term.length);
}
function jumpTo(mi, si) {
  goTo(mi, si);
  closeSearch();
  document.getElementById('searchInput').value = '';
}
function closeSearch() {
  document.getElementById('searchResults').classList.remove('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.header-search')) closeSearch();
});

// ===== SIDEBAR (mobile) =====
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebarBackdrop');
  const open = sb.classList.toggle('open');
  bd.classList.toggle('show', open);
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('show');
}

// ===== TOAST =====
let toastTimer = null;
function showToast(msg, celebrate) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.toggle('celebrate', !!celebrate);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), celebrate ? 3500 : 1800);
}

// ===== INIT =====
function init() {
  loadProgress();
  loadBookmarks();
  loadNotes();
  loadChecklist();
  renderSidebar();
  renderSlide();
  updateProgress();
}

init();
