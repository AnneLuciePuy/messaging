import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class MatPaginatorIntlFrench extends MatPaginatorIntl {
  itemsPerPageLabel = 'Éléments par page:';
  nextPageLabel = 'Page suivante';
  previousPageLabel = 'Page précédente';
  firstPageLabel = 'Première page';
  lastPageLabel = 'Dernière page';
}