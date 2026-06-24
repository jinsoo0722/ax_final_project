# React + Vite

이 템플릿은 Vite에서 React를 빠르게 시작할 수 있도록 최소한의 설정(HMR 포함)과 일부 Oxlint 규칙 예시를 제공합니다.

현재 공식으로 사용 가능한 플러그인 두 가지:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) — Oxc 사용
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) — SWC 사용

## React Compiler

이 템플릿에서는 개발 및 빌드 성능에 미치는 영향을 고려하여 React Compiler가 기본 활성화되어 있지 않습니다. React Compiler를 추가하려면 다음 문서를 참고하세요:
https://react.dev/learn/react-compiler/installation

## Oxlint 설정 확장

프로덕션 수준의 애플리케이션을 개발 중이라면 타입 인식 린트 규칙이 활성화된 TypeScript 사용을 권장합니다. TypeScript 및 Oxlint의 TypeScript 관련 규칙 통합 방법은 TS 템플릿을 참고하세요:
https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
