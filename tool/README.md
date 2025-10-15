- chromium: Win_x64_999644_chrome-win
- RenderDoc_1.13_64.msi
- file ChromiumInjectGPU.bat in chromium unzip  
set:  
```SET RENDERDOC_HOOK_EGL=0```  
```call "chrome.exe" --disable-gpu-sandbox --gpu-startup-dialog```

- vggt
```python demo_gradio.py```
