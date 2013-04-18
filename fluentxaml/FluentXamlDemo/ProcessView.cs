using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using System.ComponentModel;

namespace FluentXamlDemo
{
    public sealed class ProcessView : INotifyPropertyChanged
    {
        public string Name { get; private set; }
        public int Id { get; private set; }
        public long WorkingSetSize { get; private set; }
        public FileVersionInfo MainModuleInfo { get; private set; }

        public Action PrepareApply(Process sourceProcess)
        {
            string name;
            int? id;
            long? workingSetSize;
            FileVersionInfo mainModuleInfo;

            try { name = sourceProcess.ProcessName; }
            catch { name = null; }

            try { id = sourceProcess.Id; }
            catch { id = null; }

            try { workingSetSize = sourceProcess.WorkingSet64; }
            catch { workingSetSize = null; }

            try { mainModuleInfo = sourceProcess.MainModule.FileVersionInfo; }
            catch { mainModuleInfo = null; }

            return () =>
                {
                    if (name != null)
                        this.Name = name;
                    if( id!=null )
                        this.Id = id.Value;
                    if (workingSetSize != null)
                        this.WorkingSetSize = workingSetSize.Value;
                    if (mainModuleInfo != null)
                        this.MainModuleInfo = mainModuleInfo;

                    var temp = this.PropertyChanged;
                    if (temp != null)
                    {
                        temp(this, new PropertyChangedEventArgs("Name"));
                        temp(this, new PropertyChangedEventArgs("Id"));
                        temp(this, new PropertyChangedEventArgs("WorkingSetSize"));
                        temp(this, new PropertyChangedEventArgs("MainModuleInfo"));
                    }
                };
        }

        public event PropertyChangedEventHandler PropertyChanged;
    }
}
