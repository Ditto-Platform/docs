// 简单验证vitepress配置的脚本
const fs = require('fs');
const path = require('path');

// 检查配置文件是否存在
const configPath = path.join(__dirname, '.vitepress', 'config.mts');
if (fs.existsSync(configPath)) {
  console.log('✅ vitepress配置文件存在');
  
  // 读取配置文件内容
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // 检查是否包含新添加的文档
  if (configContent.includes('NapCatQQ使用教程')) {
    console.log('✅ NapCatQQ使用教程已添加到配置中');
  } else {
    console.log('❌ NapCatQQ使用教程未添加到配置中');
  }
  
  if (configContent.includes('简儿问题&解决方法汇总')) {
    console.log('✅ 简儿问题&解决方法汇总已添加到配置中');
  } else {
    console.log('❌ 简儿问题&解决方法汇总未添加到配置中');
  }
  
} else {
  console.log('❌ vitepress配置文件不存在');
}

// 检查文档文件是否存在
const docs = [
  'NapCatQQ使用教程.md',
  '简儿问题&解决方法汇总.md'
];

docs.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  if (fs.existsSync(docPath)) {
    console.log(`✅ ${doc} 文件存在`);
    // 检查文件大小
    const stats = fs.statSync(docPath);
    if (stats.size > 0) {
      console.log(`   文件大小: ${stats.size} bytes`);
    } else {
      console.log(`   ❌ 文件为空`);
    }
  } else {
    console.log(`❌ ${doc} 文件不存在`);
  }
});

console.log('\n配置检查完成！');