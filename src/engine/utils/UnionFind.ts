/**
 * Union-Find (Disjoint Set Union) data structure.
 * Tracks which region each element belongs to and merges regions efficiently.
 *
 * Path compression in find() flattens the tree on every lookup,
 * giving nearly O(1) amortized time per operation.
 */
export class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = new Array(size).fill(0);
  }

  find(x: number): number {
    // Path compression — point every node directly to root
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(a: number, b: number): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return;

    // Union by rank — attach smaller tree under larger tree
    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB;
    } else if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA;
    } else {
      this.parent[rootB] = rootA;
      this.rank[rootA]++;
    }
  }

  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }
}
