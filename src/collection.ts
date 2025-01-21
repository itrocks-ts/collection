import { ObjectOrType }          from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/class'

const COLLECTION = Symbol('collection')

export default Collection
export function Collection(value = true)
{
	return decorate(COLLECTION, value)
}

export function collectionOf(target: ObjectOrType)
{
	return decoratorOf(target, COLLECTION, false)
}

export function decorateDefaultCollectionClasses()
{
	Collection()(Array)
	Collection()(Map)
	Collection()(Set)
}
