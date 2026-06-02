const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;

// MIME 타입 매핑
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // 디렉토리 경로 탐색 시 기본적으로 index.html 서빙
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // 쿼리 스트링 제거
    filePath = filePath.split('?')[0];
    
    // 파일 절대 경로 계산 (tire-dashboard 폴더 내부를 기준)
    const fullPath = path.join(__dirname, filePath);
    
    // 파일 존재 여부 확인 및 서빙
    fs.stat(fullPath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found: 요청하신 파일을 찾을 수 없습니다.');
            return;
        }

        const ext = path.extname(fullPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(fullPath);
        stream.pipe(res);
    });
});

// 내부 IP 자동 검출 함수
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            // Node.js 버전이나 OS환경에 따라 family가 string 'IPv4'이거나 number 4일 수 있음
            if ((alias.family === 'IPv4' || alias.family === 4) && !alias.internal) {
                ips.push(alias.address);
            }
        }
    }
    return ips;
}

server.listen(PORT, '0.0.0.0', () => {
    const localIPs = getLocalIPs();
    console.log('\x1b[36m%s\x1b[0m', '==================================================');
    console.log('\x1b[32m%s\x1b[0m', '  [Benchmarking to Strategy] 사내망 웹 서버 구동 중');
    console.log('\x1b[36m%s\x1b[0m', '==================================================');
    console.log(`  - 로컬 접속:   \x1b[33mhttp://localhost:${PORT}\x1b[0m`);
    
    if (localIPs.length > 0) {
        localIPs.forEach(ip => {
            console.log(`  - 사내망 공유: \x1b[33mhttp://${ip}:${PORT}\x1b[0m (동료들과 이 주소로 공유하세요!)`);
        });
    } else {
        console.log('  - 사내망 공유: 활성화된 네트워크 어댑터를 찾지 못했습니다.');
    }
    console.log('\x1b[36m%s\x1b[0m', '==================================================');
    console.log('  서버를 종료하려면 Ctrl+C를 누르세요.');
});
