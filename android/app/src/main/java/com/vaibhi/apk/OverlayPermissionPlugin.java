package com.vaibhi.apk;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "OverlayPermission")
public class OverlayPermissionPlugin extends Plugin {

    private static final int REQUEST_CODE_OVERLAY_PERMISSION = 1234;
    private PluginCall savedCall;

    @PluginMethod
    public void checkPermission(PluginCall call) {
        boolean hasPermission = hasOverlayPermission();
        JSObject ret = new JSObject();
        ret.put("value", hasPermission);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (hasOverlayPermission()) {
            JSObject ret = new JSObject();
            ret.put("value", true);
            call.resolve(ret);
            return;
        }

        savedCall = call;
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + getContext().getPackageName()));
        getActivity().startActivityForResult(intent, REQUEST_CODE_OVERLAY_PERMISSION);
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);

        if (requestCode == REQUEST_CODE_OVERLAY_PERMISSION) {
            if (savedCall != null) {
                boolean hasPermission = hasOverlayPermission();
                JSObject ret = new JSObject();
                ret.put("value", hasPermission);
                savedCall.resolve(ret);
                savedCall = null;
            }
        }
    }

    private boolean hasOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return Settings.canDrawOverlays(getContext());
        }
        return true; // Before Android M, this permission is granted at install time
    }
}