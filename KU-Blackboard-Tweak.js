// ==UserScript==
// @name         고려대학교 블랙보드 녹강 출석확인
// @namespace    https://kulms.korea.ac.kr/
// @version      0.1
// @description  고려대학교 블랙보드의 녹화강의 출석현황을 보여줍니다
// @author       Meda
// @match        https://kulms.korea.ac.kr/webapps/blackboard/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ac.kr
// @grant        none
// @license      MIT
// ==/UserScript==
 
var currentUrl = window.location.href;
if(currentUrl.includes('course_id=')){
    var urlPoint = currentUrl.indexOf('course_id=');
    var courseId = currentUrl.substring(urlPoint+10, urlPoint+19);
 
    document.querySelector("#courseMenuPalette_contents").insertAdjacentHTML('afterbegin', `<li id="paletteItem:" class="clearfix ">
                                     <a href="/webapps/blackboard/execute/blti/launchPlacement?blti_placement_id=_136_1&course_id=`+courseId+`&mode=view" target="_self">
                                     <span title="녹강 출결 확인">녹강 출결 확인</span></a></li>`);
}