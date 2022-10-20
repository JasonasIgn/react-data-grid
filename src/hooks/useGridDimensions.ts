import { useRef, useState } from 'react';
import type { OuterScrollOptions } from '../types';
import { useLayoutEffect } from './useLayoutEffect';

export function useGridDimensions(
  outerScroll?: OuterScrollOptions
): [
  parentRef: React.RefObject<HTMLDivElement>,
  gridRef: React.RefObject<HTMLDivElement>,
  width: number,
  height: number,
  offsetTop: number,
  isWidthInitialized: boolean
] {
  const gridRef = useRef<HTMLDivElement>(null);
  const dynamicParentRef = outerScroll?.ref ?? gridRef;
  const [offsetTop, setOffsetTop] = useState(0);
  const [inlineSize, setInlineSize] = useState(1);
  const [blockSize, setBlockSize] = useState(1);
  const [isWidthInitialized, setWidthInitialized] = useState(false);

  useLayoutEffect(() => {
    const { ResizeObserver } = window;

    // don't break in Node.js (SSR), jest/jsdom, and browsers that don't support ResizeObserver
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ResizeObserver == null) return;

    const refForWidth = outerScroll?.watchHorizontal ? dynamicParentRef : gridRef;
    const { clientWidth, offsetWidth } = refForWidth.current!;
    const { width } = refForWidth.current!.getBoundingClientRect();
    const initialWidth = width - offsetWidth + clientWidth;
    setInlineSize(initialWidth);
    setWidthInitialized(true);

    const refForHeight = outerScroll?.watchVertical ? dynamicParentRef : gridRef;
    const { clientHeight, offsetHeight } = refForHeight.current!;
    const { offsetTop } = gridRef.current!;
    const { height } = refForHeight.current!.getBoundingClientRect();
    const initialHeight = height - offsetHeight + clientHeight;
    if (outerScroll?.watchVertical) {
      setOffsetTop(offsetTop);
    }
    setBlockSize(initialHeight);

    const outerScrollresizeObserver = new ResizeObserver((entries) => {
      const size = entries[0].contentBoxSize[0];
      if (outerScroll?.watchHorizontal) {
        setInlineSize(size.inlineSize);
      }
      if (outerScroll?.watchVertical) {
        setBlockSize(size.blockSize);
      }
    });

    const originalResizeObserver = new ResizeObserver((entries) => {
      const size = entries[0].contentBoxSize[0];
      if (!outerScroll?.watchHorizontal) {
        setInlineSize(size.inlineSize);
      }
      if (!outerScroll?.watchVertical) {
        setBlockSize(size.blockSize);
      }
    });

    if (outerScroll) {
      outerScrollresizeObserver.observe(dynamicParentRef.current!);
    }

    if (!outerScroll?.watchHorizontal || !outerScroll.watchVertical) {
      originalResizeObserver.observe(gridRef.current!);
    }

    return () => {
      if (outerScroll) {
        outerScrollresizeObserver.disconnect();
      }
      if (!outerScroll?.watchHorizontal || !outerScroll.watchVertical) {
        originalResizeObserver.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [dynamicParentRef, gridRef, inlineSize, blockSize, offsetTop, isWidthInitialized];
}
