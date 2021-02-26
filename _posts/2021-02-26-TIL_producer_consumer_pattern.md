---
title: "Producer-Consumer Pattern Example"
excerpt: "데스크탑 검색 예제"

categories:
  - TIL
tags:
  - java
  - concurrency
last_modified_at: 2021-02-26T08:06:00-05:00
---

> 자바 병렬 프로그래밍 <브라이언 게츠 외 5인> 책을 읽고 정리했습니다.

`FileCrawler` 

- Producer 역할
- 디스크에 들어 있는 디렉토리 계층 구조를 따라가면서 검색 대상 파일을 작업 큐에 쌓는다

`Indexer`

- Consumer 역할
- 작업 큐에 있는 파일 이름을 뽑아ㅐ 해당 파일의 내용을 색인한다

# FileCrawler

 ```java
package concurrency;

import java.io.File;
import java.io.FileFilter;
import java.util.concurrent.BlockingDeque;

public class FileCrawler implements Runnable {
    private final BlockingDeque<File> fileQueue;
    private final FileFilter fileFilter;
    private final File root;

    public FileCrawler(BlockingDeque<File> fileQueue, FileFilter fileFilter, File root) {
        this.fileQueue = fileQueue;
        this.fileFilter = fileFilter;
        this.root = root;
    }

    @Override
    public void run() {
        try {
            crawl(root);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    private void crawl(File root) throws InterruptedException {
        File[] entries = root.listFiles();
        if (entries != null) {
            for (File entry : entries) {
                if (entry.isDirectory()) {
                    crawl(entry);
                } else if (!alreadyIndexed(entries)) {
                    fileQueue.put(entry);
                }
            }
        }
    }
}
 ```



# Indexer

```java
package concurrency;

import java.io.File;
import java.io.FileFilter;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

public class Indexer implements Runnable {
    private final BlockingQueue<File> fileQueue;

    public Indexer(BlockingQueue<File> fileQueue) {
        this.fileQueue = fileQueue;
    }

    @Override
    public void run() {
        try {
            while (true)
                indexFile(fileQueue.take());
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    public static void startIndexing(File[] roots) {
        int BOUND = 100;
        int N_CONSUMERS = 3;

        BlockingQueue<File> queue = new LinkedBlockingQueue<>(BOUND);
        FileFilter filter = pathname -> true;

        for (File root : roots) {
            new Thread(new FileCrawler(queue, filter, root)).start();
        }

        for (int i = 0; i < N_CONSUMERS; i++) {
            new Thread(new Indexer(queue)).start();
        }
    }
}
```



*계속해서 읽어나가는 중..*

