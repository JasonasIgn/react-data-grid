import { css } from '@linaria/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import DataGrid from '../../src';
import type { Column, FormatterProps } from '../../src';
import type { Props } from './types';

type Row = number;
const rows: readonly Row[] = [...Array(100).keys()];

function cellFormatter(props: FormatterProps<Row>) {
  return (
    <>
      {props.column.key}&times;{props.row}
    </>
  );
}

const scrollParentClass = css`
  overflow: auto;
`;

const someContentClass = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  border: 1px solid white;
`;

export default function MillionCells({ direction }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const columns = useMemo((): readonly Column<Row>[] => {
    const columns: Column<Row>[] = [];

    for (let i = 0; i < 100; i++) {
      const key = String(i);
      columns.push({
        key,
        name: key,
        width: 80,
        resizable: true,
        formatter: cellFormatter
      });
    }

    return columns;
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={scrollParentClass} ref={scrollRef}>
      <div className={someContentClass}>Content Here</div>
      {isMounted && (
        <DataGrid
          columns={columns}
          rows={rows}
          rowHeight={22}
          direction={direction}
          outerScroll={{ ref: scrollRef, watchVertical: true }}
        />
      )}
      <div className={someContentClass}>Content Here</div>
    </div>
  );
}
