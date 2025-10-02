// tests/parallel-batch-node.test.ts
import { ParallelBatchNode, Flow } from '../src/index';

// Define shared storage type
type SharedStorage = {
  inputNumbers?: number[];
  processedNumbers?: number[];
  executionOrder?: number[];
  finalResults?: number[];
};

class AsyncParallelNumberProcessor extends ParallelBatchNode<SharedStorage> {
  private delay: number;

  constructor(delay: number = 0.1, maxRetries: number = 1, wait: number = 0) {
    super(maxRetries, wait);
    this.delay = delay;
  }

  async prep(shared: SharedStorage): Promise<number[]> {
    return shared.inputNumbers || [];
  }

  async exec(number: number): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, this.delay * 1000));
    return number * 2;
  }

  async post(
    shared: SharedStorage,
    prepRes: number[],
    execRes: number[]
  ): Promise<string | undefined> {
    shared.processedNumbers = execRes;
    return 'processed';
  }
}

class ErrorProcessor extends ParallelBatchNode<SharedStorage> {
  constructor(maxRetries: number = 1, wait: number = 0) {
    super(maxRetries, wait);
  }

  async prep(shared: SharedStorage): Promise<number[]> {
    return shared.inputNumbers || [];
  }

  async exec(item: number): Promise<number> {
    if (item === 2) {
      throw new Error(`Error processing item ${item}`);
    }
    return item;
  }
}

class OrderTrackingProcessor extends ParallelBatchNode<SharedStorage> {
  private executionOrder: number[] = [];

  constructor(maxRetries: number = 1, wait: number = 0) {
    super(maxRetries, wait);
  }

  async prep(shared: SharedStorage): Promise<number[]> {
    this.executionOrder = [];
    shared.executionOrder = this.executionOrder;
    return shared.inputNumbers || [];
  }

  async exec(item: number): Promise<number> {
    const delay = item % 2 === 0 ? 0.1 : 0.05;
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    this.executionOrder.push(item);
    return item;
  }

  async post(
    shared: SharedStorage,
    prepRes: number[],
    execRes: number[]
  ): Promise<string | undefined> {
    shared.executionOrder = this.executionOrder;
    return undefined;
  }
}

describe('AsyncParallelBatchNode Tests', () => {
  test('parallel processing', async () => {
    // Test that numbers are processed in parallel by measuring execution time
    const shared: SharedStorage = {
      inputNumbers: Array.from({ length: 5 }, (_, i) => i),
    };

    const processor = new AsyncParallelNumberProcessor(0.1);

    // Record start time
    const startTime = Date.now();
    await processor.run(shared);
    const endTime = Date.now();

    // Check results
    const expected = [0, 2, 4, 6, 8]; // Each number doubled
    expect(shared.processedNumbers).toEqual(expected);

    // Since processing is parallel, total time should be approximately
    // equal to the delay of a single operation, not delay * number_of_items
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(200); // Should be around 100ms plus minimal overhead
  });

  test('empty input', async () => {
    // Test processing of empty input
    const shared: SharedStorage = {
      inputNumbers: [],
    };

    const processor = new AsyncParallelNumberProcessor();
    await processor.run(shared);

    expect(shared.processedNumbers).toEqual([]);
  });

  test('single item', async () => {
    // Test processing of a single item
    const shared: SharedStorage = {
      inputNumbers: [42],
    };

    const processor = new AsyncParallelNumberProcessor();
    await processor.run(shared);

    expect(shared.processedNumbers).toEqual([84]);
  });

  test('large batch', async () => {
    // Test processing of a large batch of numbers
    const inputSize = 100;
    const shared: SharedStorage = {
      inputNumbers: Array.from({ length: inputSize }, (_, i) => i),
    };

    const processor = new AsyncParallelNumberProcessor(0.01);
    await processor.run(shared);

    const expected = Array.from({ length: inputSize }, (_, i) => i * 2);
    expect(shared.processedNumbers).toEqual(expected);
  });

  test('error handling', async () => {
    // Test error handling during parallel processing
    const shared: SharedStorage = {
      inputNumbers: [1, 2, 3],
    };

    const processor = new ErrorProcessor();

    await expect(async () => {
      await processor.run(shared);
    }).rejects.toThrow('Error processing item 2');
  });

  test('concurrent execution', async () => {
    // Test that tasks are actually running concurrently by tracking execution order
    const shared: SharedStorage = {
      inputNumbers: Array.from({ length: 4 }, (_, i) => i), // [0, 1, 2, 3]
    };

    const processor = new OrderTrackingProcessor();
    await processor.run(shared);

    // Odd numbers should finish before even numbers due to shorter delay
    expect(shared.executionOrder?.indexOf(1)).toBeLessThan(
      shared.executionOrder?.indexOf(0) as number
    );
    expect(shared.executionOrder?.indexOf(3)).toBeLessThan(
      shared.executionOrder?.indexOf(2) as number
    );
  });

  test('integration with Flow', async () => {
    // Test integration with Flow
    const shared: SharedStorage = {
      inputNumbers: Array.from({ length: 5 }, (_, i) => i),
    };

    class ProcessResultsNode extends ParallelBatchNode<SharedStorage> {
      async prep(shared: SharedStorage): Promise<number[]> {
        return shared.processedNumbers || [];
      }

      async exec(num: number): Promise<number> {
        return num + 1;
      }

      async post(
        shared: SharedStorage,
        prepRes: number[],
        execRes: number[]
      ): Promise<string | undefined> {
        shared.finalResults = execRes;
        return 'completed';
      }
    }

    const processor = new AsyncParallelNumberProcessor();
    const resultsProcessor = new ProcessResultsNode();

    processor.on('processed', resultsProcessor);

    const pipeline = new Flow(processor);
    await pipeline.run(shared);

    // Each number should be doubled and then incremented
    const expected = [1, 3, 5, 7, 9];
    expect(shared.finalResults).toEqual(expected);
  });
});
