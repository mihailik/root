using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

using Mi.PE;

namespace Zoom.PE
{
    public class ZoomLayout : Control, INotifyPropertyChanged
    {
        static readonly PropertyChangedEventArgs ContentTemplatePropertyChangedEventArgs = new PropertyChangedEventArgs("ContentTemplate");
        static readonly PropertyChangedEventArgs IsMiniModePropertyChangedEventArgs = new PropertyChangedEventArgs("IsMiniMode");

        bool m_IsMiniMode;
        bool isTemplateUpdateQueued;

        public ZoomLayout()
        {
            this.DefaultStyleKey = typeof(ZoomLayout);
            this.SizeChanged += new SizeChangedEventHandler(ZoomLayout_SizeChanged);
        }

        public object Content { get { return (object)GetValue(ContentProperty); } set { SetValue(ContentProperty, value); } }
        #region ContentProperty = DependencyProperty.Register(...)
        public static readonly DependencyProperty ContentProperty = DependencyProperty.Register(
            "Content",
            typeof(object),
            typeof(ZoomLayout),
            new PropertyMetadata((sender, e) => ((ZoomLayout)sender).OnContentChanged((object)e.OldValue)));
        #endregion

        public DataTemplate MiniTemplate { get { return (DataTemplate)GetValue(MiniTemplateProperty); } set { SetValue(MiniTemplateProperty, value); } }
        #region MiniTemplateProperty = DependencyProperty.Register(...)
        public static readonly DependencyProperty MiniTemplateProperty = DependencyProperty.Register(
            "MiniTemplate",
            typeof(DataTemplate),
            typeof(ZoomLayout),
            new PropertyMetadata((sender, e) => ((ZoomLayout)sender).OnMiniTemplateChanged((DataTemplate)e.OldValue)));
        #endregion

        public DataTemplate MaxiTemplate { get { return (DataTemplate)GetValue(MaxiTemplateProperty); } set { SetValue(MaxiTemplateProperty, value); } }
        #region MaxiTemplateProperty = DependencyProperty.Register(...)
        public static readonly DependencyProperty MaxiTemplateProperty = DependencyProperty.Register(
            "MaxiTemplate",
            typeof(DataTemplate),
            typeof(ZoomLayout),
            new PropertyMetadata((sender, e) => ((ZoomLayout)sender).OnMaxiTemplateChanged((DataTemplate)e.OldValue)));
        #endregion

        public double ThresholdWidth { get { return (double)GetValue(ThresholdWidthProperty); } set { SetValue(ThresholdWidthProperty, value); } }
        #region ThresholdWidthProperty = DependencyProperty.Register(...)
        public static readonly DependencyProperty ThresholdWidthProperty = DependencyProperty.Register(
            "ThresholdWidth",
            typeof(double),
            typeof(ZoomLayout),
            new PropertyMetadata(100.0, (sender, e) => ((ZoomLayout)sender).OnThresholdWidthChanged((double)e.OldValue)));
        #endregion

        public double ThresholdHeight { get { return (double)GetValue(ThresholdHeightProperty); } set { SetValue(ThresholdHeightProperty, value); } }
        #region ThresholdHeightProperty = DependencyProperty.Register(...)
        public static readonly DependencyProperty ThresholdHeightProperty = DependencyProperty.Register(
            "ThresholdHeight",
            typeof(double),
            typeof(ZoomLayout),
            new PropertyMetadata(64.0, (sender, e) => ((ZoomLayout)sender).OnThresholdHeightChanged((double)e.OldValue)));
        #endregion

        public DataTemplate ContentTemplate
        {
            get { return this.IsMiniMode ? this.MiniTemplate : MaxiTemplate; }
        }

        public bool IsMiniMode
        {
            get { return m_IsMiniMode; }
            private set
            {
                if (value == this.IsMiniMode)
                    return;

                this.m_IsMiniMode = value;

                var propertyChangedHandler = this.PropertyChanged;
                if (propertyChangedHandler != null)
                {
                    propertyChangedHandler(this, ContentTemplatePropertyChangedEventArgs);
                    propertyChangedHandler(this, IsMiniModePropertyChangedEventArgs);
                }
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        public override void OnApplyTemplate()
        {
            base.OnApplyTemplate();

            UpdateTemplate();
            isTemplateUpdateQueued = false;
        }

        private void OnContentChanged(object oldContent)
        {
            QueueTemplateUpdate();
        }

        private void OnMiniTemplateChanged(DataTemplate oldMiniTemplate)
        {
            QueueTemplateUpdate();
        }

        private void OnMaxiTemplateChanged(DataTemplate oldMaxiTemplate)
        {
            QueueTemplateUpdate();
        }

        private void OnThresholdWidthChanged(double oldThresholdWidth)
        {
            QueueTemplateUpdate();
        }

        private void OnThresholdHeightChanged(double oldThresholdHeight)
        {
            QueueTemplateUpdate();
        }

        void ZoomLayout_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            QueueTemplateUpdate();
        }

        private void QueueTemplateUpdate()
        {
            if (isTemplateUpdateQueued)
                return;

            isTemplateUpdateQueued = true;
            this.Dispatcher.BeginInvoke(new Action(delegate
            {
                UpdateTemplate();

                isTemplateUpdateQueued = false;
            }));            
        }

        private void UpdateTemplate()
        {
            this.IsMiniMode =
                this.ActualWidth < ThresholdWidth
                || this.ActualHeight < ThresholdHeight;
        }

    }
}