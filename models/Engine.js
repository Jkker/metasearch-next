import { Schema, model, models } from 'mongoose';

export const EngineSchema = new Schema(
	{
		name: { type: String, required: true, trim: true, index: true },
		url: { type: String, required: true, trim: true },
		key: String,
		icon: String,
		color: String,
		preload: { type: Boolean, default: false },
		embeddable: { type: Boolean, default: false },
		weight: { type: Number, default: 0 },
		disabled: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

export default models.Engine || model('Engine', EngineSchema);
