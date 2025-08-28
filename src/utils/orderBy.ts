type OrderByFn<TObject> = (a: TObject, b: TObject) => number;

export function ascending<TValue>(valA: TValue, valB: TValue): number {
  if (valA > valB) {
    return 1;
  }
  if (valB > valA) {
    return -1;
  }

  return 0;
}

export function orderBy<TObject, TValue>(value: (x: TObject) => TValue): OrderByFn<TObject> {
  return (a: TObject, b: TObject) => {
    const valA = value(a);
    const valB = value(b);

    return ascending(valA, valB);
  };
}

export function descending<TValue>(valA: TValue, valB: TValue): number {
  if (valA > valB) {
    return -1;
  }
  if (valB > valA) {
    return 1;
  }

  return 0;
}

export function orderByDescending<TObject, TValue>(value: (x: TObject) => TValue): OrderByFn<TObject> {
  return (a: TObject, b: TObject) => {
    const valA = value(a);
    const valB = value(b);

    return descending(valA, valB);
  };
}
