const fs = require('fs');
const path = require('path');

// 正则匹配 t('中文字符 其他字符'), 如果没有中文字符，不匹配
const tFunctionRegex = /t\('([^']*[\u4e00-\u9fa5]+[^']*)'\)/g;

let chineseDict = {};

function traverseDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      traverseDirectory(fullPath);
    } else if (stats.isFile()) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      let matches;

      while ((matches = tFunctionRegex.exec(content)) !== null) {
        const fullMatch = matches[0]; // 完整的 t('中文字符')
        // 去除 t(' 和 ')，只保留其中的字符
        const chinese = matches[1];
        // 存入 JSON 对象
        chineseDict[chinese] = chinese;
      }
    }
  });
}

// 生成 JSON 文件
function saveJson() {
  const jsonContent = JSON.stringify(chineseDict, null, 2);
  fs.writeFileSync('chinese-strings.json', jsonContent, 'utf-8');
}

const rootDir = './'; // 可修改为你的项目路径
traverseDirectory(rootDir);
saveJson();

console.log('中文字符提取完成，已保存为 chinese-strings.json');
