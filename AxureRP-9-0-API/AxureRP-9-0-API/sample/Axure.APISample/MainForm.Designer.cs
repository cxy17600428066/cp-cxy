namespace Axure.APISample {
    partial class MainForm {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing) {
            if (disposing && (components != null)) {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent() {
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.sourceFileTextBox = new System.Windows.Forms.TextBox();
            this.targetFileTextBox = new System.Windows.Forms.TextBox();
            this.selectSourceFileButton = new System.Windows.Forms.Button();
            this.selectTargetFileButton = new System.Windows.Forms.Button();
            this.generateButton = new System.Windows.Forms.Button();
            this.selectImageTargetButton = new System.Windows.Forms.Button();
            this.imageTargetTextBox = new System.Windows.Forms.TextBox();
            this.label4 = new System.Windows.Forms.Label();
            this.clearPathsLabel = new System.Windows.Forms.LinkLabel();
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(12, 9);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(165, 13);
            this.label1.TabIndex = 0;
            this.label1.Text = "Select the source and target files:";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(12, 42);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(44, 13);
            this.label2.TabIndex = 1;
            this.label2.Text = "Source:";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(12, 68);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(66, 13);
            this.label3.TabIndex = 2;
            this.label3.Text = "XML Target:";
            // 
            // sourceFileTextBox
            // 
            this.sourceFileTextBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.sourceFileTextBox.Location = new System.Drawing.Point(84, 39);
            this.sourceFileTextBox.Name = "sourceFileTextBox";
            this.sourceFileTextBox.Size = new System.Drawing.Size(331, 20);
            this.sourceFileTextBox.TabIndex = 3;
            // 
            // targetFileTextBox
            // 
            this.targetFileTextBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.targetFileTextBox.Location = new System.Drawing.Point(84, 65);
            this.targetFileTextBox.Name = "targetFileTextBox";
            this.targetFileTextBox.Size = new System.Drawing.Size(331, 20);
            this.targetFileTextBox.TabIndex = 4;
            // 
            // selectSourceFileButton
            // 
            this.selectSourceFileButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.selectSourceFileButton.Location = new System.Drawing.Point(421, 37);
            this.selectSourceFileButton.Name = "selectSourceFileButton";
            this.selectSourceFileButton.Size = new System.Drawing.Size(34, 23);
            this.selectSourceFileButton.TabIndex = 5;
            this.selectSourceFileButton.Text = "...";
            this.selectSourceFileButton.UseVisualStyleBackColor = true;
            this.selectSourceFileButton.Click += new System.EventHandler(this.selectSourceFileButton_Click);
            // 
            // selectTargetFileButton
            // 
            this.selectTargetFileButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.selectTargetFileButton.Location = new System.Drawing.Point(421, 63);
            this.selectTargetFileButton.Name = "selectTargetFileButton";
            this.selectTargetFileButton.Size = new System.Drawing.Size(34, 23);
            this.selectTargetFileButton.TabIndex = 6;
            this.selectTargetFileButton.Text = "...";
            this.selectTargetFileButton.UseVisualStyleBackColor = true;
            this.selectTargetFileButton.Click += new System.EventHandler(this.selectTargetFileButton_Click);
            // 
            // generateButton
            // 
            this.generateButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.generateButton.Location = new System.Drawing.Point(380, 118);
            this.generateButton.Name = "generateButton";
            this.generateButton.Size = new System.Drawing.Size(75, 23);
            this.generateButton.TabIndex = 7;
            this.generateButton.Text = "Generate";
            this.generateButton.UseVisualStyleBackColor = true;
            this.generateButton.Click += new System.EventHandler(this.generateButton_Click);
            // 
            // selectImageTargetButton
            // 
            this.selectImageTargetButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.selectImageTargetButton.Location = new System.Drawing.Point(421, 89);
            this.selectImageTargetButton.Name = "selectImageTargetButton";
            this.selectImageTargetButton.Size = new System.Drawing.Size(34, 23);
            this.selectImageTargetButton.TabIndex = 10;
            this.selectImageTargetButton.Text = "...";
            this.selectImageTargetButton.UseVisualStyleBackColor = true;
            this.selectImageTargetButton.Click += new System.EventHandler(this.selectImageTargetButton_Click);
            // 
            // imageTargetTextBox
            // 
            this.imageTargetTextBox.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.imageTargetTextBox.Location = new System.Drawing.Point(84, 91);
            this.imageTargetTextBox.Name = "imageTargetTextBox";
            this.imageTargetTextBox.Size = new System.Drawing.Size(331, 20);
            this.imageTargetTextBox.TabIndex = 9;
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(12, 94);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(73, 13);
            this.label4.TabIndex = 8;
            this.label4.Text = "Image Target:";
            // 
            // linkLabel1
            // 
            this.clearPathsLabel.AutoSize = true;
            this.clearPathsLabel.Location = new System.Drawing.Point(81, 118);
            this.clearPathsLabel.Name = "linkLabel1";
            this.clearPathsLabel.Size = new System.Drawing.Size(60, 13);
            this.clearPathsLabel.TabIndex = 11;
            this.clearPathsLabel.TabStop = true;
            this.clearPathsLabel.Text = "Clear paths";
            this.clearPathsLabel.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.clearPathsLabel_LinkClicked);
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(460, 148);
            this.Controls.Add(this.clearPathsLabel);
            this.Controls.Add(this.selectImageTargetButton);
            this.Controls.Add(this.imageTargetTextBox);
            this.Controls.Add(this.label4);
            this.Controls.Add(this.generateButton);
            this.Controls.Add(this.selectTargetFileButton);
            this.Controls.Add(this.selectSourceFileButton);
            this.Controls.Add(this.targetFileTextBox);
            this.Controls.Add(this.sourceFileTextBox);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.label1);
            this.Name = "MainForm";
            this.Text = "Axure RP XML Generator";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox sourceFileTextBox;
        private System.Windows.Forms.TextBox targetFileTextBox;
        private System.Windows.Forms.Button selectSourceFileButton;
        private System.Windows.Forms.Button selectTargetFileButton;
        private System.Windows.Forms.Button generateButton;
        private System.Windows.Forms.Button selectImageTargetButton;
        private System.Windows.Forms.TextBox imageTargetTextBox;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.LinkLabel clearPathsLabel;
    }
}

