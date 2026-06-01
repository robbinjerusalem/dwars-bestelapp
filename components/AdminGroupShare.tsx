'use client';

import type { Order } from '@/lib/types';
import { euro, orderTotal } from '@/lib/money';

type AdminGroupShareProps = {
  orders: Order[];
  selectedWeek: string;
};

function itemText(item: Order['items'][number]) {
  const optionText = item.options?.length
    ? ` + ${item.options.map(option => option.name).join(', ')}`
    : '';

  return `${item.quantity}x ${item.productName}${optionText}`;
}

function fridayFromWeekKey(weekKey: string) {
  const match = weekKey.match(/^(\d{4})-W(\d{2})$/);

  if (!match) return weekKey;

  const year = Number(match[1]);
  const week = Number(match[2]);

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;

  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

  const friday = new Date(mondayWeek1);
  friday.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7 + 4);

  return friday.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default function AdminGroupShare({
  orders,
  selectedWeek
}: AdminGroupShareProps) {
  const fridayText = fridayFromWeekKey(selectedWeek);

  const sortedOrders = [...orders].sort((a, b) =>
    a.personName.localeCompare(b.personName, 'nl-NL')
  );

  async function shareImage() {
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');

    if (!canvasContext) {
      alert('Afbeelding maken mislukt');
      return;
    }

    const ctx = canvasContext;

    const width = 1400;
    const padding = 50;
    const headerHeight = 145;
    const footerHeight = 20;
    const columnGap = 55;
    const columnWidth = (width - padding * 2 - columnGap) / 2;
    const nameLineHeight = 36;
    const orderLineHeight = 28;
    const gapBetweenPeople = 26;

    ctx.font = '24px Arial';

    const rows = sortedOrders.map(order => {
      const lines = order.items.map(itemText);

      const height =
        nameLineHeight + lines.length * orderLineHeight + gapBetweenPeople;

      return { order, lines, height };
    });

    const splitIndex = Math.ceil(rows.length / 2);
    const leftRows = rows.slice(0, splitIndex);
    const rightRows = rows.slice(splitIndex);

    const leftHeight = leftRows.reduce((sum, row) => sum + row.height, 0);
    const rightHeight = rightRows.reduce((sum, row) => sum + row.height, 0);
    const contentHeight = Math.max(leftHeight, rightHeight);

    const height = headerHeight + contentHeight + footerHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Dwars bestelling', padding, 58);

    ctx.font = '30px Arial';
    ctx.fillText(fridayText, padding, 102);

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, 125);
    ctx.lineTo(width - padding, 125);
    ctx.stroke();

    function drawRows(columnRows: typeof rows, x: number, startY: number) {
      let y = startY;

      columnRows.forEach(({ order, lines }) => {
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(order.personName, x, y);

        const amount = euro(orderTotal(order));
        const amountWidth = ctx.measureText(amount).width;
        ctx.fillText(amount, x + columnWidth - amountWidth, y);

        y += nameLineHeight;

        ctx.fillStyle = '#374151';
        ctx.font = '24px Arial';

        lines.forEach(line => {
          ctx.fillText(line, x, y);
          y += orderLineHeight;
        });

        y += 6;

        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + columnWidth, y);
        ctx.stroke();

        y += gapBetweenPeople - 6;
      });
    }

    drawRows(leftRows, padding, headerHeight);
    drawRows(rightRows, padding + columnWidth + columnGap, headerHeight);

    canvas.toBlob(async blob => {
      if (!blob) {
        alert('Afbeelding maken mislukt');
        return;
      }

      const file = new File([blob], `dwars-${selectedWeek}.png`, {
        type: 'image/png'
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Dwars ${fridayText}`,
          text: '',
          files: [file]
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dwars-${selectedWeek}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  }

  return (
    <div className="card" style={{ marginTop: 18, marginBottom: 18 }}>
      <h3>Groepsapp overzicht</h3>

      <p className="small">
        Maak automatisch een afbeelding en deel die samen met de open Tikkie.
      </p>

      <button className="btn" onClick={shareImage}>
        Deel als afbeelding
      </button>
    </div>
  );
}