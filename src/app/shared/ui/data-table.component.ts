import { Component, Input } from '@angular/core';

export interface DataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

export type DataTableRow = Record<string, string | number | null | undefined>;

@Component({
  selector: 'fg-data-table',
  standalone: true,
  template: `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            @for (column of columns; track column.key) {
              <th [attr.data-align]="column.align || 'left'">{{ column.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track $index) {
            <tr>
              @for (column of columns; track column.key) {
                <td [attr.data-align]="column.align || 'left'">{{ cell(row, column.key) }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class DataTableComponent {
  @Input({ required: true }) columns: DataTableColumn[] = [];
  @Input({ required: true }) rows: DataTableRow[] = [];

  cell(row: DataTableRow, key: string): string | number {
    const value = row[key];
    return value ?? '—';
  }
}