const WATERMARK_ROWS = [
  [
    '道法三千六百门，人人各执一苗根',
    '人法地，地法天，天法道，道法自然',
    '玄之又玄，众妙之门',
  ],
  [
    '大道之数五十，其用四十有九，而人遁其一',
    '天地不仁，以万物为刍狗',
    '大巧若拙，大音希声，大象无形',
  ],
  [
    '大道无形，生育天地；大道无情，运行日月；大道无名，长养万物',
    '致虚极，守静笃。万物并作，吾以观复',
    '其大无外，其小无内',
  ],
  [
    '内观其心，心无其心；外观其形，形无其形',
    '天子望气，谈笑杀人',
    '道法三千六百门，人人各执一苗根',
  ],
  [
    '玄之又玄，众妙之门',
    '人法地，地法天，天法道，道法自然',
    '大道之数五十，其用四十有九，而人遁其一',
  ],
];

import type { CSSProperties } from 'react';

export function ProductSiliconWatermark() {
  return (
    <div className='silicon-watermark' aria-hidden>
      {WATERMARK_ROWS.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={
            rowIndex % 2 === 0
              ? 'silicon-watermark-row'
              : 'silicon-watermark-row is-reversed'
          }
          style={
            {
              '--silicon-watermark-duration': `${44 + rowIndex * 7}s`,
            } as CSSProperties
          }
        >
          {[0, 1].map(copyIndex => (
            <div className='silicon-watermark-copy' key={copyIndex}>
              {row.map(text => (
                <span key={`${copyIndex}-${text}`}>{text}</span>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
