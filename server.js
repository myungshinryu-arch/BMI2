const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// BM_FINAL 폴더 전체를 정적 웹 파일 경로로 지정합니다.
app.use(express.static(__dirname));

// 루트 접속 시 통합 포털 index.html을 서빙합니다.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  BM-Intelligence Integrated Portal Server is now running!`);
  console.log(`  Access URL: http://localhost:${PORT}`);
  console.log(`================================================================`);
});
