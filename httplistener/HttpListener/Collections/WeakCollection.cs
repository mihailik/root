using System;
using System.Collections.Generic;
using System.Text;

namespace Mihailik.Collections
{
	public class WeakCollection<T>
	{
		const int InventoryThreshold = 256;
		readonly object sync = new object();
		List<WeakReference> innerList = new List<WeakReference>();
		int lastInventoryCount;

		public void Add(T item)
		{
			lock( sync )
			{
				if( innerList.Count > lastInventoryCount + InventoryThreshold )
					PerformInventory();

				innerList.Add(new WeakReference(item));
			}
		}

		public T[] GetItems()
		{
			lock( sync )
			{
				List<T> result = new List<T>(innerList.Count);
				foreach( WeakReference wref in innerList )
				{
					object wrefTarget = wref.Target;
					if( wrefTarget != null )
					{
						result.Add((T)wrefTarget);
					}
				}

				if( innerList.Count - result.Count > InventoryThreshold )
					PerformInventory();

				return result.ToArray();
			}
		}

		void PerformInventory()
		{
			List<WeakReference> newList = new List<WeakReference>();
			foreach( WeakReference wref in innerList )
			{
				if( wref.IsAlive )
					newList.Add(wref);
			}
			innerList = newList;
			lastInventoryCount = innerList.Count;
		}
	}
}
