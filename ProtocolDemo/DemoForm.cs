using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using System.IO;
using Mihailik.InternetExplorer.Protocols;
using Mihailik.InternetExplorer;

namespace ProtocolDemo
{
    public partial class DemoForm : Form
    {
        public DemoForm()
        {
            InitializeComponent();

            NonAdminComRegistration.Register<HtmlColorProtocol>();
            HtmlColorProtocol.RegisterTemporary();
            this.Disposed += delegate
            {
                HtmlColorProtocol.Unregister();
                NonAdminComRegistration.Unregister<HtmlColorProtocol>();
            };

            NonAdminComRegistration.Register<LocalWebProtocol>();
            LocalWebProtocol.RegisterTemporary();
            this.Disposed += delegate
            {
                LocalWebProtocol.Unregister();
                NonAdminComRegistration.Unregister<LocalWebProtocol>();
            };

            NonAdminComRegistration.Register<ResourceProtocol>();
            ResourceProtocol.RegisterTemporary();
            this.Disposed += delegate
            {
                ResourceProtocol.Unregister();
                NonAdminComRegistration.Unregister<ResourceProtocol>();
            };
        }

        private void DemoForm_Load(object sender, EventArgs e)
        {
            this.Font = SystemFonts.DialogFont;
        }

        private void aboutBlankLabel_Click(object sender, EventArgs e)
        {
            webBrowser1.Navigate("about:blank");
        }

        private void colorLabel_Click(object sender, EventArgs e)
        {
            webBrowser1.Navigate(
                "color:" + Path.GetFullPath("..\\DemoForm.cs"));
        }

        private void webBrowser1_Navigating(object sender, WebBrowserNavigatingEventArgs e)
        {
            statusLabel.Text = "Opening " + e.Url + "...";
        }

        private void webBrowser1_Navigated(object sender, WebBrowserNavigatedEventArgs e)
        {
            urlTextBox.Text = e.Url.ToString();
            statusLabel.Text = "Done.";
        }

        private void goButton_Click(object sender, EventArgs e)
        {
            webBrowser1.Navigate(urlTextBox.Text);
        }

        private void mywebLabel_Click(object sender, EventArgs e)
        {
            webBrowser1.Navigate("myweb:" + Path.GetFullPath("..\\Page.aspx"));
        }

        private void urlTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyData == Keys.Enter)
            {
                webBrowser1.Navigate(urlTextBox.Text);
            }
        }

        private void netresLabel_Click(object sender, EventArgs e)
        {
            webBrowser1.Navigate("netres:" + typeof(Program).Assembly.Location);
        }
    }
}
