# 교시표

중·고등학생이 월요일부터 금요일까지 1~8교시 수업을 빠르게 등록하고 관리할 수 있는 반응형 시간표 웹앱입니다. 계정이나 서버 없이 현재 브라우저에 자동 저장됩니다.

## 실행

```bash
npm install
npm run dev
```

## 검사

```bash
npm run lint
npm run test:run
npm run build
```

## 배포

`main` 브랜치가 GitHub의 공개 `school-timetable` 저장소에 푸시되면 GitHub Actions가 검사와 빌드를 수행한 뒤 GitHub Pages에 배포합니다. 저장소의 **Settings → Pages → Source**는 **GitHub Actions**로 설정해야 합니다.

배포 주소는 `https://<GitHub 사용자명>.github.io/school-timetable/` 형식입니다.

## 데이터 안내

- 시간표는 `localStorage`의 `school-timetable:v1` 키에만 저장됩니다.
- 브라우저 데이터를 삭제하거나 다른 기기를 사용하면 시간표가 이어지지 않습니다.
- 회원가입, 클라우드 동기화, 사용자 추적은 포함하지 않습니다.
