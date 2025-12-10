[![npm version](https://img.shields.io/npm/v/@itrocks/collection?logo=npm)](https://www.npmjs.org/package/@itrocks/collection)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/collection)](https://www.npmjs.org/package/@itrocks/collection)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/collection?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/collection)
[![issues](https://img.shields.io/github/issues/itrocks-ts/collection)](https://github.com/itrocks-ts/collection/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# collection

Identify classes containing collections of objects using decorators.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/collection
```

## Usage

`@itrocks/collection` lets you explicitly mark classes as *collections of
objects* and later query that information at runtime.

It is typically used by higher‑level libraries (like the it.rocks framework)
to adapt behaviour when they deal with lists or maps of objects instead of a
single instance.

### Minimal example

```ts
import { Collection, collectionOf } from '@itrocks/collection'

@Collection()
class UserList extends Array<User> {}

class User {
	name = ''
}

// Later in your code, you can test whether a class is considered a collection
console.log(collectionOf(UserList)) // true
console.log(collectionOf(Array))    // true (decorated by default)
console.log(collectionOf(User))     // false
```

### Real‑world style example

In a typical application you may introduce your own collection wrapper type to
add domain‑specific helpers while still having it recognised as a collection by
other parts of the system (renderers, serializers, transformers, …):

```ts
import { Collection, collectionOf } from '@itrocks/collection'

interface PaginationInfo {
	page:      number
	pageSize:  number
	totalRows: number
}

@Collection()
class PaginatedList<T> extends Array<T> {
	constructor(public readonly pagination: PaginationInfo, items: T[]) {
		super(...items)
	}
}

function renderValue(value: unknown): string {
	// If value is a collection, we choose a list‑oriented rendering strategy
	if (collectionOf(value)) {
		const size = (value as Iterable<unknown>).length ?? 0
		return `Collection with ${size} item(s)`
	}

	// Fallback for non‑collection values
	return String(value)
}

const users = new PaginatedList({ page: 1, pageSize: 20, totalRows: 42 }, [])

console.log(collectionOf(users))          // true (instance is recognised)
console.log(renderValue(users))           // "Collection with 0 item(s)"
console.log(collectionOf(PaginatedList))  // true (class is recognised)
```

## API

All exported symbols of `@itrocks/collection` are meant for consumers.

### `function Collection(value?: boolean): DecorateCaller<object>`

Decorator factory used to mark a class as *being a collection of objects*.

#### Parameters

- `value` (optional, `boolean`, default `true`)
  - `true` – the target is considered a collection.
  - `false` – explicitly mark the target as *not* a collection (can be used to
    override previous configuration).

#### Usage

```ts
@Collection()
class OrderList extends Array<Order> {}

@Collection(false)
class NotACollection {}
```

You can apply `@Collection()` to:

- built‑in classes (if you want to override the defaults),
- your own classes that conceptually represent a collection.

---

### `function collectionOf(target: ObjectOrType): boolean`

Checks whether a value or a constructor has been marked as a collection.

#### Parameters

- `target` (`ObjectOrType`) – either:
  - a class/constructor (e.g. `Array`, `UserList`), or
  - an object instance (e.g. `users`, `new Map()`).

#### Returns

- `boolean` – `true` if the target is considered a collection, otherwise
  `false`.

#### Usage

```ts
collectionOf(Array)              // true
collectionOf(new Set())          // true
collectionOf(UserList)           // true if decorated with @Collection()
collectionOf(new UserList())     // true as well
collectionOf({})                 // false
```

Use this helper wherever your code needs to adapt behaviour based on whether
it deals with a collection or a scalar value.

---

### `function decorateDefaultCollectionClasses(): void`

Registers the default collection classes used by JavaScript as collections:

- `Array`
- `Map`
- `Set`

Calling this function is idempotent and safe to do on application start.

```ts
import { decorateDefaultCollectionClasses } from '@itrocks/collection'

decorateDefaultCollectionClasses()
```

After calling it, `collectionOf(Array)`, `collectionOf(Map)` and
`collectionOf(Set)` will all return `true`.

---

### `const initCollection: typeof decorateDefaultCollectionClasses`

Convenience alias that simply points to `decorateDefaultCollectionClasses`.

This name is commonly used in the it.rocks ecosystem when registering all
framework‑level dependencies during application bootstrap:

```ts
import { initCollection } from '@itrocks/collection'

initCollection() // marks Array, Map and Set as collection classes
```

## Typical use cases

- Mark your own wrapper types (`PaginatedList<T>`, `SortedSet<T>`, …) as
  collections so other libraries can detect and treat them as such.
- Implement generic renderers, serializers or transformers that need to know
  whether a value is a collection (e.g. to decide between table vs. single
  record views).
- Integrate with the it.rocks framework, which calls `initCollection()` during
  startup so that common collection classes are recognised out of the box.
