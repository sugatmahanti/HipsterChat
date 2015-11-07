'use strict';
console.log('browser-win32.js loaded');

const overlayBadge = require('./overlay-badge.js');
const ipc = require('ipc');
const remote = require('remote');
const NativeImage = remote.require('native-image');
const mainWindow = remote.getCurrentWindow();

let notificationCounter = 0;

// Electron doesn't support notifications in Windows yet. https://github.com/atom/electron/issues/262
// So we hijack the Notification API.
const OldNotification = Notification;

Notification = function (title, options) {
	const notification = new OldNotification(title, options);

	ipc.send('notification-shim', {
		title,
		options
	});

	notificationCounter++;
	setBadge(notificationCounter);

	return notification;
};
Notification.prototype = OldNotification.prototype;
Notification.permission = OldNotification.permission;
Notification.requestPermission = OldNotification.requestPermission;

function removeBadge() {
	notificationCounter = 0;
	mainWindow.setOverlayIcon(null, '');
}

function setBadge() {
	const text = notificationCounter.toString();
	const badgeDataURL = overlayBadge.create(text);
	const img = NativeImage.createFromDataUrl(badgeDataURL);

	mainWindow.setOverlayIcon(img, text);
}

ipc.on('reset-notifications', () => removeBadge());
