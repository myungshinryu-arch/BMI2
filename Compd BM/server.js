const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Compd BM 폴더의 정적 파일들을 서빙합니다.
app.use(express.static(__dirname));

// 기본 경로로 접속하면 index.html 파일을 반환합니다.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  Compound BM Report Server is now running!`);
  console.log(`  Access URL: http://localhost:${PORT}`);
  console.log(`================================================================`);
});
