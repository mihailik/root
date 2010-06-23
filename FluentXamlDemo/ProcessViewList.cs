using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections.ObjectModel;
using System.Diagnostics;

namespace FluentXamlDemo
{
    public sealed class ProcessViewList : ReadOnlyObservableCollectionBase<ProcessView>
    {
        readonly object syncInnerListAccess = new object();

        public ProcessViewList() : base(new ObservableCollection<ProcessView>())
        {
        }

        public Action PrepareApply(IEnumerable<Process> processes)
        {
            var processList = processes.ToList();
            var processById = processList.ToDictionary(p => p.Id);
            
            var applyHandlers = new List<Action>();
            var removeProcessViews = new List<ProcessView>();

            ProcessView[] innerListArray;
            lock (syncInnerListAccess)
            {
                innerListArray = this.InnerList.ToArray();
            }

            var processViewById = new Dictionary<int, ProcessView>();
            foreach (var p in innerListArray)
            {
                processViewById.Add(p.Id, p);

                Process process;
                if (processById.TryGetValue(p.Id, out process))
                {
                    applyHandlers .Add(p.PrepareApply(process));
                }
                else
                {
                    removeProcessViews.Add(p);
                }
            }

            var addProcessViews = new List<ProcessView>();

            foreach (var p in processList)
            {
                ProcessView processView;

                if (!processViewById.TryGetValue(p.Id, out processView))
                {
                    processView = new ProcessView();
                    processViewById.Add(p.Id, processView);
                    addProcessViews.Add(processView);
                }

                applyHandlers.Add(processView.PrepareApply(p));
            }

            return () =>
                {
                    foreach (var h in applyHandlers)
                    {
                        h();
                    }

                    lock (syncInnerListAccess)
                    {
                        foreach (var r in removeProcessViews)
                        {
                            this.InnerList.Remove(r);
                        }

                        foreach (var a in addProcessViews)
                        {
                            this.InnerList.Add(a);
                        }
                    }
                };
        }
    }
}
