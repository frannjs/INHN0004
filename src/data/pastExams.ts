export interface ExamFile {
  id: string;
  file: string;
  group: string;
  title: string;
  date: string | null;
  note?: string;
  pages: number;
  bytes: number;
}

export const EXAM_ZIP = { file: 'All_Past_Exams.zip', bytes: 2941792 };
export const EXAM_DOWNLOAD_ENDPOINT = '/api/exam-downloads';

export const EXAM_FILES: ExamFile[] = [
  {
    "id": "ws2021-22-mock",
    "file": "WS2021-22_Mock.pdf",
    "group": "WS 2021/22",
    "title": "Mock exam",
    "date": null,
    "pages": 23,
    "bytes": 383649
  },
  {
    "id": "ws2021-22-endterm",
    "file": "WS2021-22_Endterm.pdf",
    "group": "WS 2021/22",
    "title": "Endterm",
    "date": null,
    "pages": 23,
    "bytes": 373839
  },
  {
    "id": "ws2021-22-retake",
    "file": "WS2021-22_Retake.pdf",
    "group": "WS 2021/22",
    "title": "Retake",
    "date": null,
    "pages": 23,
    "bytes": 369246
  },
  {
    "id": "ws2022-23-endterm",
    "file": "WS2022-23_Endterm.pdf",
    "group": "WS 2022/23",
    "title": "Endterm",
    "date": null,
    "pages": 18,
    "bytes": 209839
  },
  {
    "id": "ws2022-23-retake",
    "file": "WS2022-23_Retake.pdf",
    "group": "WS 2022/23",
    "title": "Retake",
    "date": null,
    "pages": 20,
    "bytes": 299029
  },
  {
    "id": "ws2023-24-short-test-1-variant-a",
    "file": "WS2023-24_Short_Test_1_Variant_A.pdf",
    "group": "WS 2023/24",
    "title": "Short Test 1, variant A",
    "date": null,
    "pages": 12,
    "bytes": 176746
  },
  {
    "id": "ws2023-24-short-test-1-variant-b",
    "file": "WS2023-24_Short_Test_1_Variant_B.pdf",
    "group": "WS 2023/24",
    "title": "Short Test 1, variant B",
    "date": null,
    "pages": 12,
    "bytes": 207299
  },
  {
    "id": "ws2023-24-endterm-2024-02-19",
    "file": "WS2023-24_Endterm_2024-02-19.pdf",
    "group": "WS 2023/24",
    "title": "Endterm",
    "date": "19 Feb 2024",
    "pages": 21,
    "bytes": 196093
  },
  {
    "id": "ws2023-24-retake-2024-04-04",
    "file": "WS2023-24_Retake_2024-04-04.pdf",
    "group": "WS 2023/24",
    "title": "Retake",
    "date": "4 Apr 2024",
    "pages": 19,
    "bytes": 203428
  },
  {
    "id": "ws2024-25-short-test-1-2024-11-20",
    "file": "WS2024-25_Short_Test_1_2024-11-20.pdf",
    "group": "WS 2024/25",
    "title": "Short Test 1",
    "date": "20 Nov 2024",
    "pages": 12,
    "bytes": 136869
  },
  {
    "id": "ws2024-25-short-test-2-2024-12-18",
    "file": "WS2024-25_Short_Test_2_2024-12-18.pdf",
    "group": "WS 2024/25",
    "title": "Short Test 2",
    "date": "18 Dec 2024",
    "pages": 13,
    "bytes": 169893
  },
  {
    "id": "ws2024-25-short-test-3-2025-01-29",
    "file": "WS2024-25_Short_Test_3_2025-01-29.pdf",
    "group": "WS 2024/25",
    "title": "Short Test 3",
    "date": "29 Jan 2025",
    "pages": 13,
    "bytes": 233309
  },
  {
    "id": "endterm-undated",
    "file": "Endterm_undated.pdf",
    "group": "Undated",
    "title": "Endterm",
    "date": null,
    "note": "Cover and three answer-space pages reconstructed.",
    "pages": 20,
    "bytes": 212133
  },
  {
    "id": "ws2024-25-retake-2025-04-10",
    "file": "WS2024-25_Retake_2025-04-10.pdf",
    "group": "WS 2024/25",
    "title": "Retake",
    "date": "10 Apr 2025",
    "pages": 21,
    "bytes": 240698
  },
];
