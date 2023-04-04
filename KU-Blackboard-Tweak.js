// ==UserScript==
// @name         고려대학교 블랙보드 트윅
// @namespace    https://kulms.korea.ac.kr/
// @version      0.2
// @description  고려대학교 블랙보드의 녹화강의 출석현황을 보거나 영상을 다운로드 합니다.
// @author       Meda
// @match        https://kulms.korea.ac.kr/webapps/blackboard/*
// @match        https://kucom.korea.ac.kr/em/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ac.kr
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==


function attendanceCheckFunc() {
    var currentUrl = window.location.href;
    if(currentUrl.includes('course_id=')){
        var urlPoint = currentUrl.indexOf('course_id=');
        var courseId = currentUrl.substring(urlPoint+10, urlPoint+19);

        document.querySelector("#courseMenuPalette_contents").insertAdjacentHTML('afterbegin', `<li id="paletteItem:" class="clearfix ">
                                     <a href="/webapps/blackboard/execute/blti/launchPlacement?blti_placement_id=_136_1&course_id=`+courseId+`&mode=view" target="_self">
                                     <span title="녹강 출결 확인">녹강 출석 확인</span></a></li>`);
    }
}

if (window.location.href.startsWith('https://kulms.korea.ac.kr/webapps/blackboard/')) {
    attendanceCheckFunc();
}


function mediaDownloadFunc() {
    function downloadFile(url, filename, btn) {
        btn.style.pointerEvents = 'none'; // 클릭 이벤트 막기
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "referer": "https://kucom.korea.ac.kr/",
            },
            responseType: "blob",
            onprogress: function (progress) {
                if (progress.lengthComputable) {
                    const percentComplete = (progress.loaded / progress.total) * 100;
                    btn.textContent = `${filename} 다운로드 중 (${percentComplete.toFixed(2)}%)`;
                } else {
                    btn.textContent = `${filename} 다운로드 중`;
                }
            },
            onload: function(response) {
                var blob = response.response;
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = filename;
                link.click();
                btn.textContent = filename + ' 다운로드 완료';
            }
        });
    }

    const mediaExtensions = ['mp4', 'webm', 'ogg', 'ogv', 'avi', 'wmv', 'mkv', 'mov', 'flv', 'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'opus', 'wma'];
    function waitForPlayTimeTextArea() {
        const playTimeTextArea = document.querySelector('.vc-pctrl-on-playing');
        if (playTimeTextArea) {
            let mediaElement = null;
            const audioElement = document.querySelector('#vc-sdplay-audio audio');
            const videoElement = document.querySelector('#video-play-video1 video');
            if (audioElement?.src?.includes('https') &&
                mediaExtensions.some(ext => audioElement.src.endsWith(`.${ext}`))
               ) {
                mediaElement = audioElement;
            } else if (videoElement?.src?.includes('https') &&
                       !videoElement?.src?.includes('intro.mp4') &&
                       !videoElement?.src?.includes('preloader.mp4') &&
                       mediaExtensions.some(ext => videoElement.src.endsWith(`.${ext}`))
                      ) {
                mediaElement = videoElement;
            }
            if (mediaElement) {
                const mediaSource = mediaElement.src;
                const downloadBtn = document.createElement('span');
                downloadBtn.classList.add('download', 'btn');
                downloadBtn.textContent = mediaElement.tagName === 'AUDIO' ? '오디오 다운로드' : '비디오 다운로드';
                downloadBtn.style.display = 'inline-block';
                downloadBtn.style.fontSize = '12px';
                downloadBtn.style.color = '#b1b1b1';
                downloadBtn.style.cursor = 'pointer';
                playTimeTextArea.insertAdjacentElement('afterend', downloadBtn);
                downloadBtn.addEventListener('mouseover', function() {
                    downloadBtn.style.color = '#ffffff';
                });

                downloadBtn.addEventListener('mouseout', function() {
                    downloadBtn.style.color = '#b1b1b1';
                });
                downloadBtn.addEventListener('click', function() {
                    const mediaSourceExtension = mediaSource.substr(mediaSource.lastIndexOf('.'));
                    const illegalCharsRegex = /[<>:"/\\|?*\x00-\x1F]/g; // Windows 파일 시스템에서 사용 불가능한 문자들 + null 문자
                    const cleanedFilename = content_title.replace(illegalCharsRegex, '').substring(0, 230);
                    const combinedFilename = cleanedFilename + mediaSourceExtension;
                    downloadFile(mediaSource, combinedFilename, downloadBtn);
                });
            } else {
                // audioElement나 videoElement가 없거나 src에 https가 포함되어 있지 않은 경우 100ms 후에 다시 시도합니다.
                setTimeout(waitForPlayTimeTextArea, 100);
            }
        } else {
            // .vc-pctrl-on-playing 요소가 존재하지 않는 경우 100ms 후에 다시 시도합니다.
            setTimeout(waitForPlayTimeTextArea, 100);
        }
    }
    waitForPlayTimeTextArea();
}

if (window.location.href.startsWith('https://kucom.korea.ac.kr/em/')) {
    mediaDownloadFunc();
}