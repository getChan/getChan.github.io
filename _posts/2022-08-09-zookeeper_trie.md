---
title: "Zookeeper내 Trie 구현"
excerpt: "Trie 자료구조 in Zookeeper"

categories:
  - TIL
tags:
  - data structure
  - zookeeper
last_modified_at: 2022-08-09T08:06:00-05:00
---

# 출처

https://codecatalog.org/articles/zookeeper-trie/

# 배운점

`ReadWriteLock`
- `synchronized` 와 동작방식이 다르다. writer 락이 걸려있지 않은 이상 reader 락을 얻는 스레드는 여러개가 접근 가능하다.
- 다만, 정~말 분석하고 분석해서 꼭 필요한 경우가 아니면 쓰지말라고 권고한다.
- 주키퍼의 경우, 리더 스레드가 훨씬 많고 성능을 최대한 끌어올리기 위하여 사용하는 듯 하다.

`Deque`
- 노드로부터 루트까지의 경로를 저장하기 위해 `Deque`을 사용한다
- 앞쪽에 요소를 추가하고 제거하지는 않는다.
- `LinkedList`도 적절해 보이지만, `ArrayDeque`가 더 (시간?)효율적이다. - *아마 Array를 문자열로 조인할때 더 빠르지 않을까. 순서 뒤집을 필요도 없고.*

Trie
- 문자열 탐색, 검색어 자동완성, 문자열 검사 등에 주로 쓰인다.
- 탐색 시간복잡도 = $O(가장 긴 Path)$
- 삽입 시간복잡도 = $O(가장 긴 Path)$


# 소스코드


```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Stream;


public class PathTrie {
    public static final Logger LOG = LoggerFactory.getLogger(PathTrie.class);

    // Root node of PathTrie
    private final TrieNode rootNode;


    private final ReadWriteLock lock = new ReentrantReadWriteLock(true);

    private final Lock readLock = lock.readLock();

    private final Lock writeLock = lock.writeLock();

    public PathTrie() {
        this.rootNode = new TrieNode(null, "/");
    }

    /**
     * Add a path to the path trie. All paths are relative to the root node.
     */
    public void addPath(final String path) {

        Objects.requireNonNull(path, "Path cannot be null");

        if (path.length() == 0) {
            throw new IllegalArgumentException("Invalid path: " + path);
        }

        final String[] pathComponents = split(path);

        writeLock.lock();
        try {
            TrieNode parent = rootNode;
            for (final String part : pathComponents) {
                TrieNode child = parent.getChild(part);
                if (child == null) {
                    child = new TrieNode(parent, part);
                    parent.addChild(part, child);
                }
                parent = child;
            }
            parent.setProperty(true);
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * Delete a path from the trie. All paths are relative to the root node.
     */
    public void deletePath(final String path) {
        Objects.requireNonNull(path, "Path cannot be null");

        if (path.length() == 0) {
            throw new IllegalArgumentException("Invalid path : " + path);
        }

        final String[] pathComponents = split(path);

        writeLock.lock();
        try {
            TrieNode parent = rootNode;
            for (final String part : pathComponents) {
                if (parent.getChild(part) == null) {
                    // the path does not exist
                    return;
                }
                parent = parent.getChild(part);
                LOG.debug("{}", parent);
            }

            final TrieNode realParent = parent.getParent();
            realParent.deleteChild(parent.getValue());
        } finally {
            writeLock.unlock();
        }
    }

    /**
     * Return true if the given path exists in the trie,
     * otherwise return false.
     * <p>
     * All paths are relative to the root node.
     */
    public boolean existNode(final String path) {
        Objects.requireNonNull(path, "Path cannot be null");

        if (path.length() == 0) {
            throw new IllegalArgumentException("Invalid path : " + path);
        }

        final String[] pathComponents = split(path);

        readLock.lock();
        try {
            TrieNode parent = rootNode;
            for (String part : pathComponents) {
                if (parent.getChild(part) == null) {
                    // path does not exist
                    return false;
                }
                parent = parent.getChild(part);
                LOG.debug("{}", parent);
            }
        } finally {
            readLock.unlock();
        }
        return true;
    }

    /**
     * Return the largest prefix for the input path.
     * All paths are relative to the root node.
     */
    public String findMaxPrefix(final String path) {
        Objects.requireNonNull(path, "Path cannot be null");

        final String[] pathComponents = split(path);

        readLock.lock();
        try {
            TrieNode parent = rootNode;
            TrieNode deepestPropertyNode = null;
            for (final String element : pathComponents) {
                parent = parent.getChild(element);
                if (parent == null) {
                    LOG.debug("{}", element);
                    break;
                }
                if (parent.hasProperty()) {
                    deepestPropertyNode = parent;
                }
            }

            if (deepestPropertyNode == null) {
                return "/";
            }

            final Deque<String> treePath = new ArrayDeque<>();
            TrieNode node = deepestPropertyNode;
            while (node != this.rootNode) {
                treePath.offerFirst(node.getValue());
                node = node.parent;
            }
            return "/" + String.join("/", treePath);
        } finally {
            readLock.unlock();
        }
    }

    /**
     * Clear all nodes in the trie.
     */
    public void clear() {
        writeLock.lock();
        try {
            rootNode.getChildren().clear();
        } finally {
            writeLock.unlock();
        }
    }


    private static String[] split(String path) {
        return Stream.of(path.split("/"))
                .filter(t -> !t.trim().isEmpty())
                .toArray(String[]::new);
    }

    private class TrieNode {

        final String value;
        final Map<String, TrieNode> children;
        boolean property;
        TrieNode parent;

        /**
         * Create a trie node with parent as parameter.
         *
         * @param parent the parent of this node
         * @param value  the value stored in this node
         */
        private TrieNode(TrieNode parent, String value) {
            this.value = value;
            this.parent = parent;
            this.property = false;
            this.children = new HashMap<>(4);
        }

        boolean hasProperty() {
            return property;
        }

        void setProperty(boolean property) {
            this.property = property;
        }

        TrieNode getParent() {
            return parent;
        }

        void setParent(TrieNode parent) {
            this.parent = parent;
        }

        public String getValue() {
            return value;
        }

        /**
         * Add a child to the existing node.
         */
        void addChild(String childName, TrieNode node) {
            this.children.put(childName, node);
        }

        void deleteChild(String childName) {
            this.children.computeIfPresent(childName, (key, childNode) -> {
                // Node no longer has an external property associated
                childNode.setProperty(false);

                // Delete it if it has no children
                if (childNode.isLeafNode()) {
                    childNode.setParent(null);
                    return null;
                }

                return childNode;
            });
        }


        /**
         * Return the child of a node mapping to the input child name.
         *
         * @param childName the name of the child
         * @return the child of a node
         */
        TrieNode getChild(String childName) {
            return this.children.get(childName);
        }

        /**
         * Get the list of children of this trienode.
         *
         * @return A collection containing the node's children
         */
        Collection<String> getChildren() {
            return children.keySet();
        }

        boolean isLeafNode() {
            return children.isEmpty();
        }
    }
}
```

# 테스트 코드

```java
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;

public class PathTrieTest {
    private final PathTrie pathTrie = new PathTrie();

    @Test
    public void findMaxPrefixNullPath() {
        assertThrows(NullPointerException.class, () -> {
            pathTrie.findMaxPrefix(null);
        });
    }

    @Test
    public void findMaxPrefixRootPath() {
        assertEquals("/", pathTrie.findMaxPrefix("/"));
    }

    @Test
    public void findMaxPrefixChildren() {
        pathTrie.addPath("node1");
        pathTrie.addPath("node1/node2");
        pathTrie.addPath("node1/node3");

        assertEquals("/node1", pathTrie.findMaxPrefix("/node1"));
        assertEquals("/node1/node2", pathTrie.findMaxPrefix("/node1/node2"));
        assertEquals("/node1/node3", pathTrie.findMaxPrefix("/node1/node3"));

    }

    @Test
    public void findMaxPrefixChildrenPrefix() {
        pathTrie.addPath("node1");

        assertEquals("/node1", pathTrie.findMaxPrefix("/node1/node2"));
        assertEquals("/node1", pathTrie.findMaxPrefix("/node1/node3"));
        
    }
}
```