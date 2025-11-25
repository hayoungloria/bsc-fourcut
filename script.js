document.addEventListener('DOMContentLoaded', () => {
    const webcamVideo = document.getElementById('webcamVideo');
    const tempCanvas = document.getElementById('tempCanvas');
    const captureButton = document.getElementById('captureButton');
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    const downloadButton = document.getElementById('downloadButton');
    const shareButton = document.getElementById('shareButton');
    const captureCountSpan = document.getElementById('captureCount');
    const galleryContainer = document.querySelector('.gallery-container');
    const photoGallery = document.getElementById('photoGallery');
    const selectPhotosButton = document.getElementById('selectPhotosButton');
    const finalFourCutCanvas = document.getElementById('finalFourCutCanvas');
    const finalFourCutCtx = finalFourCutCanvas.getContext('2d');

    // 프레임 선택 관련 요소 추가
    const frameSelectionContainer = document.querySelector('.frame-selection-container');
    const frameGallery = document.getElementById('frameGallery');
    const composeFinalPhotoButton = document.getElementById('composeFinalPhotoButton');

    let stream;
    let allCapturedPhotos = [];
    let selectedPhotoIndexes = [];
    let selectedFrameId = null; // 선택된 프레임의 ID를 저장할 변수

    const MAX_CAPTURE_PHOTOS = 8;
    const REQUIRED_SELECT_PHOTOS = 4;

    // --- 프레임 데이터 정의 ---
    const frameData = [
        {
            id: 'frame1',
            name: 'BSC 디자인 프레임',
            url: 'https://i.imgur.com/mWri6FV.png', 
            photoPositions: [
                { x: 32, y: 38, width: 336, height: 235 },
                { x: 32, y: 306, width: 336, height: 235 },
                { x: 32, y: 569, width: 336, height: 235 },
                { x: 32, y: 833, width: 336, height: 235 }
            ]
        },
        {
            id: 'frame2',
            name: '심플 화이트 프레임',
            url: 'https://i.imgur.com/mgPjQic.png', 
            photoPositions: [
                { x: 32, y: 38, width: 336, height: 235 },
                { x: 32, y: 306, width: 336, height: 235 },
                { x: 32, y: 569, width: 336, height: 235 },
                { x: 32, y: 833, width: 336, height: 235 }
            ]
        },
        {
            id: 'frame3',
            name: '심플 블랙 프레임',
            url: 'https://i.imgur.com/VmQBwHW.png', 
            photoPositions: [
                { x: 32, y: 38, width: 336, height: 235 },
                { x: 32, y: 306, width: 336, height: 235 },
                { x: 32, y: 569, width: 336, height: 235 },
                { x: 32, y: 833, width: 336, height: 235 }
            ]
        },
        {
            id: 'frame4',
            name: '토마토 프레임',
            url: 'https://i.imgur.com/OXH07mr.png',
            photoPositions: [
                { x: 32, y: 38, width: 336, height: 235 },
                { x: 32, y: 306, width: 336, height: 235 },
                { x: 32, y: 569, width: 336, height: 235 },
                { x: 32, y: 833, width: 336, height: 235 }
            ]
        },
        {
            id: 'frame5',
            name: '풀 프레임',
            url: 'https://i.imgur.com/iIew2mq.png', 
            photoPositions: [
                { x: 32, y: 38, width: 336, height: 235 },
                { x: 32, y: 306, width: 336, height: 235 },
                { x: 32, y: 569, width: 336, height: 235 },
                { x: 32, y: 833, width: 336, height: 235 }
            ]
        },
        {
            id: 'frame6',
            name: '레몬 프레임',
            url: 'https://i.imgur.com/nZpllXN.png',
            photoPositions: [
                { x: 32, y: 38, width: 336, height: 235 },
                { x: 32, y: 306, width: 336, height: 235 },
                { x: 32, y: 569, width: 336, height: 235 },
                { x: 32, y: 833, width: 336, height: 235 }
            ]
        },
        {
            id: 'frame7',
            name: '초록 풀 프레임',
            url: 'https://i.imgur.com/DBGIuFZ.png', 
            photoPositions: [
                { x: 32, y: 38, width: 336, height: 235 },
                { x: 32, y: 306, width: 336, height: 235 },
                { x: 32, y: 569, width: 336, height: 235 },
                { x: 32, y: 833, width: 336, height: 235 }
            ]
        }
    ];

    // ----------------- 초기화 및 카메라 시작 -----------------
    startButton.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            webcamVideo.srcObject = stream;
            webcamVideo.style.display = 'block';

            startButton.style.display = 'none';
            captureButton.style.display = 'inline-block';
            captureCountSpan.textContent = '0';

            allCapturedPhotos = [];
            selectedPhotoIndexes = [];
            selectedFrameId = null; // 프레임 선택 초기화
            photoGallery.innerHTML = '';
            frameGallery.innerHTML = ''; // 프레임 갤러리도 초기화

            galleryContainer.style.display = 'none';
            selectPhotosButton.style.display = 'none';
            frameSelectionContainer.style.display = 'none'; // 프레임 선택 섹션 숨김
            composeFinalPhotoButton.style.display = 'none'; // 완성 버튼 숨김
            resetButton.style.display = 'none';
            downloadButton.style.display = 'none';
            shareButton.style.display = 'none';
            document.querySelector('.final-result').style.display = 'none';
            finalFourCutCanvas.style.display = 'none';

            webcamVideo.onloadedmetadata = () => {
                tempCanvas.width = webcamVideo.videoWidth;
                tempCanvas.height = webcamVideo.videoHeight;
            };

        } catch (err) {
            console.error("카메라 접근 에러:", err);
            alert("카메라에 접근할 수 없습니다. 권한을 허용하거나 다른 카메라가 연결되어 있는지 확인해주세요.");
        }
    });

    // ----------------- 사진 촬영 -----------------
    captureButton.addEventListener('click', () => {
        if (!stream) {
            alert("먼저 카메라를 시작해주세요!");
            return;
        }
        if (allCapturedPhotos.length >= MAX_CAPTURE_PHOTOS) {
            alert("사진은 최대 8장까지 찍을 수 있습니다. 사진 선택을 진행해주세요.");
            return;
        }

        const tempCtx = tempCanvas.getContext('2d');

// ==== 프레임 비율(336:235)에 맞춰 중앙 크롭하여 캡처 ====
const FRAME_W = 336;
const FRAME_H = 235;
const FRAME_ASPECT = FRAME_W / FRAME_H;

// 현재 캔버스 크기 (기존 코드 유지)
const canvasW = tempCanvas.width;
const canvasH = tempCanvas.height;
const canvasAspect = canvasW / canvasH;

// 원본 카메라 영상 정보
const videoW = webcamVideo.videoWidth;
const videoH = webcamVideo.videoHeight;
const videoAspect = videoW / videoH;

tempCtx.save();
tempCtx.scale(-1, 1);
tempCtx.translate(-canvasW, 0);

if (videoAspect > canvasAspect) {
    // 카메라가 가로로 더 넓은 경우 → 좌우를 잘라냄
    const newW = videoH * canvasAspect;
    const sx = (videoW - newW) / 2;

    tempCtx.drawImage(
        webcamVideo,
        sx, 0, newW, videoH,
        0, 0, canvasW, canvasH
    );
} else {
    // 카메라가 세로로 더 긴 경우 → 위아래를 잘라냄
    const newH = videoW / canvasAspect;
    const sy = (videoH - newH) / 2;

    tempCtx.drawImage(
        webcamVideo,
        0, sy, videoW, newH,
        0, 0, canvasW, canvasH
    );
}

tempCtx.restore();
        const photoDataUrl = tempCanvas.toDataURL('image/jpeg', 0.9);

        allCapturedPhotos.push(photoDataUrl);
        captureCountSpan.textContent = allCapturedPhotos.length;

        const galleryItem = document.createElement('div');
        galleryItem.classList.add('gallery-item');
        galleryItem.dataset.index = allCapturedPhotos.length - 1;

        const img = document.createElement('img');
        img.src = photoDataUrl;
        galleryItem.appendChild(img);
        photoGallery.appendChild(galleryItem);

        galleryItem.addEventListener('click', () => togglePhotoSelection(galleryItem));

        galleryContainer.style.display = 'block';

        if (allCapturedPhotos.length === MAX_CAPTURE_PHOTOS) {
            captureButton.style.display = 'none';
            selectPhotosButton.style.display = 'inline-block';
            alert("사진 8장을 모두 찍었습니다. 4장을 선택해주세요!");
        }
    });

    // ----------------- 사진 선택 -----------------
    function togglePhotoSelection(item) {
        const index = parseInt(item.dataset.index);

        if (item.classList.contains('selected')) {
            item.classList.remove('selected');
            selectedPhotoIndexes = selectedPhotoIndexes.filter(i => i !== index);
        } else {
            if (selectedPhotoIndexes.length < REQUIRED_SELECT_PHOTOS) {
                item.classList.add('selected');
                selectedPhotoIndexes.push(index);
            } else {
                alert("사진은 4장만 선택할 수 있습니다.");
            }
        }

        console.log("현재 선택된 사진 수:", selectedPhotoIndexes.length);

        if (selectedPhotoIndexes.length === REQUIRED_SELECT_PHOTOS) {
            selectPhotosButton.disabled = false;
            console.log("4장 선택 완료! '사진 선택 완료' 버튼 활성화.");
        } else {
            selectPhotosButton.disabled = true;
            console.log("4장 미만 선택. '사진 선택 완료' 버튼 비활성화.");
        }
    }

    // ----------------- 사진 선택 완료 (프레임 선택 단계로 이동) -----------------
    selectPhotosButton.addEventListener('click', async () => {
        console.log("--- '사진 선택 완료' 버튼 클릭됨 ---");

        if (selectedPhotoIndexes.length !== REQUIRED_SELECT_PHOTOS) {
            alert("네컷 사진을 위해 정확히 4장을 선택해주세요.");
            console.error("오류: 4장이 선택되지 않았는데 버튼 클릭됨.");
            return;
        }

        // 카메라 스트림 중지
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            webcamVideo.srcObject = null;
            console.log("카메라 스트림 중지됨.");
        }

        webcamVideo.style.display = 'none';
        captureButton.style.display = 'none';
        selectPhotosButton.style.display = 'none';
        galleryContainer.style.display = 'none';
        
        // 프레임 선택 섹션 표시
        frameSelectionContainer.style.display = 'block';
        composeFinalPhotoButton.style.display = 'inline-block'; // 완성 버튼도 표시

        renderFrameOptions(); // 프레임 갤러리 렌더링
        console.log("UI 요소들 숨김 처리 및 프레임 선택 화면 표시 완료.");
    });

    // ----------------- 프레임 옵션 렌더링 -----------------
    function renderFrameOptions() {
        frameGallery.innerHTML = ''; // 기존 프레임 썸네일 초기화
        selectedFrameId = null; // 선택된 프레임 초기화
        composeFinalPhotoButton.disabled = true; // 프레임 선택 전에는 완성 버튼 비활성화

        frameData.forEach(frame => {
            const frameItem = document.createElement('div');
            frameItem.classList.add('frame-item');
            frameItem.dataset.frameId = frame.id;

            const img = document.createElement('img');
            img.src = frame.url;
            img.alt = frame.name;
            frameItem.appendChild(img);
            
            // 프레임 이름 표시 (선택사항)
            const frameName = document.createElement('div');
            frameName.classList.add('frame-name');
            frameName.textContent = frame.name;
            // frameItem.appendChild(frameName); // 필요하면 주석 해제

            frameGallery.appendChild(frameItem);

            frameItem.addEventListener('click', () => {
                // 이전에 선택된 프레임의 'selected' 클래스 제거
                const currentSelected = document.querySelector('.frame-item.selected');
                if (currentSelected) {
                    currentSelected.classList.remove('selected');
                }

                // 현재 클릭된 프레임에 'selected' 클래스 추가
                frameItem.classList.add('selected');
                selectedFrameId = frame.id; // 선택된 프레임 ID 저장
                composeFinalPhotoButton.disabled = false; // 프레임 선택되면 완성 버튼 활성화
                console.log("프레임 선택됨:", selectedFrameId);
            });
        });
    }

    // ----------------- 프레임 선택 완료 및 최종 네컷 합성 -----------------
    composeFinalPhotoButton.addEventListener('click', async () => {
        console.log("--- '프레임으로 완성하기' 버튼 클릭됨 ---");

        if (!selectedFrameId) {
            alert("먼저 프레임을 선택해주세요!");
            return;
        }

        // 선택된 프레임 데이터 찾기
        const selectedFrame = frameData.find(f => f.id === selectedFrameId);
        if (!selectedFrame) {
            console.error("선택된 프레임 데이터를 찾을 수 없습니다.");
            alert("프레임 선택에 오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        frameSelectionContainer.style.display = 'none';
        composeFinalPhotoButton.style.display = 'none';
        console.log("프레임 선택 UI 숨김 완료.");

        // 최종 프레임 이미지 로드
        const currentFrameImage = new Image();
        currentFrameImage.crossOrigin = 'Anonymous';
        currentFrameImage.src = selectedFrame.url;

        await new Promise((resolve, reject) => {
            currentFrameImage.onload = resolve;
            currentFrameImage.onerror = () => {
                console.error("선택된 프레임 이미지 로드 실패! URL을 확인하세요:", selectedFrame.url);
                alert("선택된 프레임 이미지를 불러올 수 없습니다. URL을 확인해주세요.");
                reject();
            };
        }).catch(() => {
            // 에러 발생 시 초기 상태로 돌아가거나 에러 메시지 표시
            resetButton.click(); // 임시로 다시 시작 버튼 클릭
            return;
        });
        console.log("선택된 프레임 이미지 로드 완료!");

        // 최종 캔버스 크기를 선택된 프레임 이미지 크기에 맞춰 설정
        finalFourCutCanvas.width = currentFrameImage.width;
        finalFourCutCanvas.height = currentFrameImage.height;
        console.log("최종 캔버스 크기 설정:", finalFourCutCanvas.width, finalFourCutCanvas.height);

        // 프레임 먼저 그리기
        finalFourCutCtx.drawImage(currentFrameImage, 0, 0, finalFourCutCanvas.width, finalFourCutCanvas.height);
        console.log("선택된 프레임 이미지 캔버스에 그리기 완료.");

        // 각 사진을 프레임의 적절한 위치에 그리기 (선택된 프레임의 photoPositions 사용)
        const photoPositions = selectedFrame.photoPositions;
        console.log("사진 삽입 위치 사용:", photoPositions);

        for (let i = 0; i < REQUIRED_SELECT_PHOTOS; i++) {
            const selectedPhotoDataUrl = allCapturedPhotos[selectedPhotoIndexes[i]];
            const img = new Image();
            img.src = selectedPhotoDataUrl;
            console.log(`사진 ${i+1} 로드 시작:`, selectedPhotoDataUrl.substring(0, 50) + "...");
            await new Promise(resolve => img.onload = resolve);
            console.log(`사진 ${i+1} 로드 완료.`);

            const pos = photoPositions[i];
            
            const imgAspectRatio = img.width / img.height;
            const frameAspectRatio = pos.width / pos.height;

            let drawX, drawY, drawWidth, drawHeight;
            
            if (imgAspectRatio > frameAspectRatio) {
                drawHeight = pos.height;
                drawWidth = img.width * (pos.height / img.height);
            } else {
                drawWidth = pos.width;
                drawHeight = img.height * (pos.width / img.width);
            }

            drawX = pos.x + (pos.width - drawWidth) / 2;
            drawY = pos.y + (pos.height - drawHeight) / 2;

            finalFourCutCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            console.log(`사진 ${i+1} 캔버스에 그리기 완료.`);
        }
        console.log("모든 사진 캔버스에 그리기 완료.");

        document.querySelector('.final-result').style.display = 'block';
        finalFourCutCanvas.style.display = 'block';
        resetButton.style.display = 'inline-block';
        downloadButton.style.display = 'inline-block';
        if (navigator.share) {
            shareButton.style.display = 'inline-block';
        }
        console.log("최종 결과 화면 표시 완료!");
    });

    // ----------------- 다시 시작 -----------------
    resetButton.addEventListener('click', () => {
        console.log("--- '다시 시작' 버튼 클릭됨 ---");

        allCapturedPhotos = [];
        selectedPhotoIndexes = [];
        selectedFrameId = null; // 프레임 선택 초기화
        
        photoGallery.innerHTML = '';
        frameGallery.innerHTML = ''; // 프레임 갤러리도 초기화
        captureCountSpan.textContent = '0';

        startButton.style.display = 'inline-block';
        captureButton.style.display = 'none';
        selectPhotosButton.style.display = 'none';
        frameSelectionContainer.style.display = 'none'; // 프레임 선택 섹션 숨김
        composeFinalPhotoButton.style.display = 'none'; // 완성 버튼 숨김
        resetButton.style.display = 'none';
        downloadButton.style.display = 'none';
        shareButton.style.display = 'none';
        document.querySelector('.final-result').style.display = 'none'; // 결과 섹션 숨김
        finalFourCutCanvas.style.display = 'none';
        webcamVideo.style.display = 'none';
        console.log("초기화 및 UI 숨김/표시 완료.");

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            webcamVideo.srcObject = null;
            console.log("카메라 스트림 중지됨.");
        }
    });

    // ----------------- 사진 저장 (다운로드) -----------------
    downloadButton.addEventListener('click', () => {
        const dataURL = finalFourCutCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `BSC_네컷사진_${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log("사진 다운로드 시도됨.");
    });

    // ----------------- 공유하기 (iMessage 포함) -----------------
    shareButton.addEventListener('click', async () => {
        console.log("--- '공유하기' 버튼 클릭됨 ---");
        if (navigator.share) {
            finalFourCutCanvas.toBlob(async (blob) => {
                const file = new File([blob], `BSC_네컷사진_${new Date().toISOString().slice(0, 10)}.png`, { type: 'image/png' });
                try {
                    await navigator.share({
                        files: [file],
                        title: 'BSC 캠프 네컷 사진',
                        text: 'BSC 캠프에서 만든 특별한 네컷 사진을 공유해요!',
                    });
                    console.log('공유 성공!');
                } catch (error) {
                    console.error('공유 실패:', error);
                    alert("공유에 실패했습니다. 사진을 저장해서 직접 공유해보세요.");
                }
            }, 'image/png');
        } else {
            alert("이 브라우저에서는 공유 기능을 지원하지 않습니다. 사진을 저장해서 직접 공유해주세요.");
        }
    });
});