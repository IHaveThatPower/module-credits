// GET MODULE CORE
import { MODULE } from './_module.mjs';

// GET CORE MODULE
import { MMP } from './module.mjs';

// FOUNDRY HOOKS -> SETUP
Hooks.once('setup', () => {
	// SET MODULE MIGRATE SETTINGS
	MODULE.setting('register', 'enableGlobalConflicts', {
		type: Boolean,
		default: true,
		config: false,
		scope: 'world',
	});
	MODULE.setting('register', 'clientMigratedVersion', {
		type: String,
		default: "0.0.0",
		scope: 'world',
		config: false
	});
	MODULE.setting('register', 'worldMigratedVersion', {
		type: String,
		default: "0.0.0",
		scope: 'world',
		config: false
	});
	MODULE.setting('register', 'lockedSettings', {
		type: Object,
		default: {},
		scope: 'world',
		config: false,
		onChange: async (settings) => {
			if (!game.user.isGM) {
				for (const [key, value] of Object.entries(settings)) {
					const settingDetails = game.settings.settings.get(key);
					await game.settings.set(settingDetails.namespace, settingDetails.key, value);
				}
				if (document.querySelector('#client-settings') ?? false) {
					game.settings.sheet.render(true);
				}
			}
		}
	});
	MODULE.setting('register', 'storePreviousOnPreset', {
		type: Boolean,
		default: true,
		scope: 'world',
	});
	MODULE.setting('register', 'storedRollback', {
		type: Object,
		default: {},
		scope: 'world',
		config: false,
	});
	MODULE.setting('register', 'presetsRollbacks', {
		type: Array,
		default: [],
		scope: 'world',
		config: false,
	});
	MODULE.setting('register', 'lockedModules', {
		type: Object,
		default: {
			'module-credits': true
		},
		scope: 'world',
		config: false,
	});

	// SET MODULE SETTINGS
	MODULE.setting('register', 'keepPresetsRollbacks', {
		type: Number,
		default: 5,
		scope: 'world',
		range: {
			min: 0,
			max: 10,
			step: 1
		},
		onChange: (numberOfRollbacks) => {
			let rollbacks = MODULE.setting('presetsRollbacks') ?? [];
				
			if (numberOfRollbacks > 0 && rollbacks.length > numberOfRollbacks) {
				const deleteRollbacks = rollbacks.length - numberOfRollbacks;
				for (let index = 0; index < deleteRollbacks; index++) {
					rollbacks.shift()
				}

				MODULE.setting('presetsRollbacks', rollbacks);
			}

		}
	});
	MODULE.setting('register', 'disableLockedModules', {
		type: Boolean,
		default: false,
		scope: 'world'
	});
	MODULE.setting('register', 'hideLockedSettings', {
		type: Boolean,
		default: true,
		scope: 'world',
	});
	MODULE.setting('register', 'disableSyncPrompt', {
		type: Boolean,
		default: true,
		config: true,
		scope: 'world'
	});
	MODULE.setting('register', 'bigPictureMode', {
		type: Boolean,
		default: true,
		config: true,
	});

	const trackedChangelogs =  {
		name: 'lib-themer.settings.trackedChangelogs.name',
		hint: 'lib-themer.settings.trackedChangelogs.hint',
		type: Object,
		default: {},
		config: false,
	}
	const presets = {
		type: Object,
		default: {},
		config: false,
		scope: 'world',
	}
	const showNewChangelogsOnLoad = {
		name: `${MODULE.ID}.settings.showNewChangelogsOnLoad.name`,
		hint: `${MODULE.ID}.settings.showNewChangelogsOnLoad.hint`,
		type: Boolean,
		default: true,
		scope: 'world',
	}
	const renamedModules = {
		type: Object,
		default: {},
		config: false
	}
	const autoPrefixModules = {
		name: `${MODULE.ID}.settings.autoPrefixModules.name`,
		hint: `${MODULE.ID}.settings.autoPrefixModules.hint`,
		type: Boolean,
		default: {},
		config: true
	}
	const smartPrefix = {
		name: `${MODULE.ID}.settings.smartPrefix.name`,
		hint: `${MODULE.ID}.settings.smartPrefix.hint`,
		type: Boolean,
		default: {},
		config: true
	}
	if (game.modules.get('lib-server-setting')?.active ?? false) {
		Hooks.once('lib-server-setting.Setup', async (SETTING) => {
			SETTING(MODULE.ID, 'trackedChangelogs', trackedChangelogs);
			SETTING(MODULE.ID, 'showNewChangelogsOnLoad', showNewChangelogsOnLoad);
			SETTING(MODULE.ID, 'renamedModules', renamedModules);
			SETTING(MODULE.ID, 'autoPrefixModules', autoPrefixModules);
			SETTING(MODULE.ID, 'smartPrefix', smartPrefix);
			SETTING(MODULE.ID, 'presets', presets);
		});
	}else{
		MODULE.setting('register', 'trackedChangelogs', trackedChangelogs);
		MODULE.setting('register', 'showNewChangelogsOnLoad', showNewChangelogsOnLoad);
		MODULE.setting('register', 'renamedModules', renamedModules);
		MODULE.setting('register', 'autoPrefixModules', autoPrefixModules);
		MODULE.setting('register', 'smartPrefix', smartPrefix);
		MODULE.setting('register', 'presets', presets);
	}

	// Handle Module Management Config onChange Event
	game.settings.settings.set(`core.${ModuleManagement.CONFIG_SETTING}`, foundry.utils.mergeObject(game.settings.settings.get(`core.${ModuleManagement.CONFIG_SETTING}`), {
		onChange: (moduleManagementData) => {
			if (Object.keys(MODULE.setting('storedRollback')).length > 0) {
				let rollbacks = MODULE.setting('presetsRollbacks') ?? [];
				rollbacks.push(MODULE.setting('storedRollback'));
				
				if (MODULE.setting('keepPresetsRollbacks') > 0 && rollbacks.length > MODULE.setting('keepPresetsRollbacks')) {
					const deleteRollbacks = rollbacks.length - MODULE.setting('keepPresetsRollbacks');
					for (let index = 0; index < deleteRollbacks; index++) {
						rollbacks.shift()
					}
				}

				MODULE.setting('presetsRollbacks', rollbacks);
			}
		}
	}, {inplace: false}))
});

