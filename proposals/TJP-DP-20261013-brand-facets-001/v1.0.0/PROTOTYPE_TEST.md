# 原型独立测试记录

版本v1.0.0；执行者ChatGPT Work；时间2026-10-13T23:43:09.857290+08:00；源码与网站测试严格分开。

node model.test.cjs：pass。验证匹配6条但首屏4条时全局品牌计数2/3/1、B筛选3条且全属于B、facet不因品牌/分页面改变、空结果、非法品牌拒绝、第二页2条、过滤后过界页回1、反序排序。
node --check app.js：pass（仅语法）。

PC原型浏览器视觉/交互：not_tested。
手机原型浏览器视觉/交互：not_tested。
快切竞态、键盘、dialog、hash恢复、加载/错误重试：代码已实现，但本轮浏览器未运行，not_tested，不能据源码称通过。

具体限制：本轮受管环境没有可用control-browser技能及Sites预览入口；按Sites技能无法启动临时预览服务器或另装浏览器。Cloud Browser可真实访问部署网站，但暴露API没有手机viewport调节，不能把iframe宽度/裁图当手机仿真。交付可直接在本地浏览器运行，coordinator审核原型时应完成PC/手机运行检查。两幅SVG是手工视觉示意，不是渲染证据。

部署前端、后端API、真实联调、移动部署效果：not_tested。当前没有生产实施，等待用户审批。不是设计已通过或网站验收通过。
