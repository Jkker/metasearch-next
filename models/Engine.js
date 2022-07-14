import mongoose from 'mongoose';

const EngineSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true, index: true },
		url: { type: String, required: true, trim: true },
		key: String,
		icon: String,
		color: String,
		preload: Boolean,
		embeddable: Boolean,
	},
	{ timestamps: true }
);

export default mongoose.models.Engine || mongoose.model('Engine', EngineSchema);
